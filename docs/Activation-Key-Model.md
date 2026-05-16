# The Activation-Key Model

**How we discovered that LLMs can't read math — and what to do about it.**

---

## 1. The Discovery

It started with the Eisenstein norm.

If you've never heard of it, don't worry — that's the whole point. The Eisenstein norm is a simple quadratic form: `N(a,b) = a² − ab + b²`. You plug in two integers, do three multiplications and two additions, and you get an integer back. A middle-schooler could compute `N(5, −3) = 25 + 15 + 9 = 49`.

Hermes-70B — a 70-billion parameter model that writes poetry, translates languages, and generates production code — answered **1364**.

Not a different formula. Not a sign error. Not even close. One thousand three hundred sixty-four. For input that should give forty-nine.

So we ran it again. And again. One hundred times with unicode notation, zero correct answers. **0% accuracy.** The model wasn't computing the wrong function — it wasn't computing *at all*. The outputs were hallucinations, inconsistent across runs, with the same value (65) appearing for completely different inputs. No polynomial of any degree fits the outputs. Brute-force regression with every integer-coefficient combination up to degree six found nothing.

Here's what made our jaws drop: when we asked the same model to "show your work step by step" for the exact same formula, it produced:

```
Step 1: f(5, -3) = 5² - 5(-3) + (-3)²
Step 2: = 25 - 5(-3) + 9
Step 3: = 25 + 15 + 9
Step 4: = 49
```

**Perfect.** The model knew the answer all along. It just couldn't access that knowledge from the notation.

That paradox — a model that computes perfectly when you ask in English but fails completely when you ask in math — is what we call the **vocabulary wall**. And it took us six hypotheses and sixty studies to understand what's really happening.

---

## 2. Five Wrong Hypotheses

Science isn't a straight line. It's a drag along the bottom, and every wrong hypothesis taught us something about the shape of the problem.

**V1: "The model doesn't know the formula."** Falsified immediately. Step-by-step prompts proved the model knows the formula perfectly. It's not a knowledge gap.

**V2: "The model is computing a different function."** We tested every polynomial candidate we could imagine — sign flips, dropped terms, wrong exponents. Nothing fit. The outputs aren't a coherent alternative computation; they're noise. The model isn't computing the wrong thing. It's not computing anything.

**V3: "It's a sign-handling issue."** We tested with all-positive inputs. Accuracy: 1.7%. Still basically zero. The minus sign wasn't the problem.

**V4: "Temperature fixes it."** At T=0.7, Hermes-70B managed 17% — barely better than the 0% at T=0. At T=1.0, still 17%. Temperature doesn't dissolve the wall. It cracks it slightly. That's not a fix; that's a leaky bucket.

**V5: "Labels are always helpful."** This one seemed right for a while. Adding "In algebra" or "Eisenstein norm" before the formula boosted accuracy dramatically. But then we found the catch: labels *hurt* for models that already compute correctly. For Tier 1 models, bare notation is optimal. The label adds noise.

Each dead end narrowed the search space until only one explanation survived.

---

## 3. The Notation Gradient

Here's the clearest result in the entire investigation. Same model, same formula, same inputs. Only the notation changes.

| Notation | Accuracy | Example |
|----------|:--------:|---------|
| Unicode superscripts (`a² − ab + b²`) | **0%** | 1364, 65, 449 — pure noise |
| ASCII multiplication (`a*a − a*b + b*b`) | **22%** | Better, but "65" still dominates |
| Natural language ("a squared minus a times b plus b squared") | **67%** | Gets most right, stumbles on negatives |
| Step-by-step ("First compute a times a...") | **~100%** | Perfect computation every time |

This is a gradient, not a binary. Each step toward natural language improves accuracy. Unicode math symbols are rare in training data — the model barely recognizes them as computation triggers. ASCII is more common but still ambiguous. Natural language activates the model's arithmetic circuits reliably. Step-by-step procedural language activates them perfectly.

The notation gradient proves something crucial: the failure isn't random. It's *systematic*. The model has a pipeline for converting symbols into computation, and that pipeline has a preference ordering. Unicode goes in, noise comes out. English goes in, correct answers come out.

---

## 4. The Three Tiers

After we understood the gradient, we tested twelve models — from 0.6 billion to 405 billion parameters — and found they split cleanly into three tiers based on how they handle the exact same math problem.

### Tier 1: Internalized Computation (100% bare, 100% scaffolded)

Seed-2.0-mini. Seed-2.0-code. **gemma3:1b** — a one-billion parameter model.

These models don't need help. You hand them `N(a,b) = a² − ab + b²` and they just compute it. No labels, no scaffolding, no step-by-step. The formula is what we'd call a compiled primitive — it's been internalized so deeply during training that it's effectively a lookup.

### Tier 2: Scaffoldable (0–50% bare, 25–100% scaffolded)

Hermes-405B. Hermes-70B. Phi4-mini. Llama3.2:1b. Qwen3-235B.

These models *can* do the math — the step-by-step proof confirmed that — but they need hand-holding to get there. Scaffolding provides a 50–100 percentage point boost. Without it, they hallucinate. With it, they often compute correctly.

Here's the kicker: **a 1B model (gemma3:1b) outperforms a 405B model (Hermes-405B).** The larger model is in Tier 2. The tiny model is in Tier 1. Parameter count has zero predictive power for tier placement. What matters is training data — specifically, whether algebraic manipulation was internalized during pre-training.

Google's Gemma 3 training heavily emphasized mathematical reasoning. The 1B model absorbed common algebraic formulas as primitives. Hermes-405B, trained on a broader corpus, recognizes the formula but can't execute it without guidance.

### Tier 3: Incompetent (0% both conditions)

Qwen3.6-35B. Qwen3:4b. Qwen3:0.6b.

These models can't reliably complete multi-step arithmetic *even with guidance*. Scaffolding doesn't help because there's nothing to scaffold. The computational capacity isn't there.

Notably, the MoE (Mixture of Experts) models in our test all landed in Tier 2 or Tier 3. MoE models activate only a fraction of their parameters per token — Qwen3-235B activates 22B out of 235B (9.4%), and Qwen3.6-35B activates 3B out of 35B (8.6%). When only 9% of your parameters are active, you lack the dense compute needed for multi-step arithmetic. Dense small models beat sparse giants per active parameter.

### The Anti-Scaffold Effect

Two models performed *worse* with scaffolding: Qwen3-235B dropped from 50% to 25%, and qwen2.5-coder:1.5b dropped from 50% to 0%. Longer prompts introduced noise that derailed their partial computation ability. More help isn't always better.

---

## 5. The Labeled Paradox

Early in the investigation, we discovered that adding a domain label like "Eisenstein norm" before the formula dramatically improved accuracy. For Hermes-70B, adding "Eisenstein norm" to `a² − ab + b²` went from 0% to 100%.

So labels help, right? Not so fast.

For Tier 1 models — the ones that already compute correctly — labels *hurt*. Bare notation is optimal. The label adds tokens that dilute the computation signal. The model doesn't need "Eisenstein norm" to tell it what to do. It already knows. The extra words just get in the way.

But for Tier 2 models, labels are essential. Without "Eisenstein norm," the model has no idea which procedure to activate. `a² − ab + b²` could be anything. With the label, it activates the correct stored procedure and computes accurately.

This paradox — labels help the models that need help and hurt the models that don't — is perfectly explained by the activation-key model. Labels are activation keys. Tier 1 models don't need keys; they've already internalized the computation. Tier 2 models need keys; without them, the door stays locked.

There's a landmine here, too. The label "Hurwitz norm" also activates a procedure — the *wrong* one (a² + ab + b²). Labels aren't magic; they're keys. The wrong key opens the wrong door. "Frobenius norm" is safe because it has no conflicting association. "Hurwitz norm" is a landmine because it does.

---

## 6. Math Is Special

We tested the same activation-key hypothesis across four non-math domains: chemistry (molar mass calculations), physics (Newtonian mechanics), logic (propositional reasoning), and code (standard algorithms).

**The vocabulary wall doesn't exist in any of them.**

| Metric | Math (Eisenstein) | Non-Math (All Domains) |
|--------|:------------------:|:----------------------:|
| Bare accuracy | 0–100% (tier-dependent) | 88–96% |
| Labeled effect | +50 to +100pp | **−4pp** (slightly worse!) |

Adding domain vocabulary to non-math prompts didn't help. It actually made things very slightly worse — the extra tokens added length without adding activation value. In chemistry, "molar mass of H2SO4" is already unambiguous. In physics, "force to accelerate 5 kg at 3 m/s²" directly activates F=ma. In logic, conditionals directly activate transitivity. In code, "reverse a linked list" directly activates the reversal algorithm.

Math is unique because mathematical notation is simultaneously:
1. **Compact** — `a² − ab + b²` encodes a lot in a few characters
2. **Ambiguous** — the same notation could be a norm, a conjugate, or a polynomial evaluation
3. **Underrepresented in training** — Unicode math symbols appear far less often than natural language
4. **Not self-activating** — the model needs a vocabulary key to select the right stored procedure

Every other domain we tested uses natural language as its native notation. Math uses symbols. And LLMs — trained overwhelmingly on natural language — simply don't have the symbol-to-computation mapping that humans learn in school.

This finding has a practical implication: any fix we build only needs to handle math. The fleet translator doesn't need to touch chemistry, physics, logic, or code. Those domains work fine as-is.

---

## 7. The Mechanism

Here's the model, in plain language:

LLMs store mathematical procedures as learned patterns from training data. These procedures are activated by context cues — primarily the vocabulary tokens that surrounded the procedure during training. Symbolic mathematical notation is an unreliable activation cue because:

1. Unicode superscripts (`²`) are rare in training data compared to natural language descriptions of the same operation
2. Without a domain label, the model has no procedure to activate — it defaults to the most common training-data variant
3. The model *knows* the math (step-by-step = ~100%) but cannot *access* that knowledge from notation alone

Think of it like a filing cabinet. The model has a folder for "quadratic norm computation." That folder is indexed by the words that appeared near it in the training corpus — "Eisenstein," "norm," "squared," "compute." The folder is *not* indexed by `a² − ab + b²`, because that exact Unicode string appeared rarely if at all in the training data.

When you say "Eisenstein norm," the model finds the folder and opens it. When you say `a² − ab + b²` with no label, the model can't find the folder. It shrugs and outputs whatever token comes next in the discourse pattern — which, for Hermes-70B, is often 1364 or 65. Not because it's computing anything. Because it's hallucinating in the absence of an activation signal.

The four states:

- **Label + Formula** → finds the right folder → 100%
- **Label only** → finds a folder, maybe the wrong one (Hurwitz landmine) → 0–100%
- **Formula only** → no folder found → defaults to most common variant or hallucinates → 0%
- **Step-by-step natural language** → the language IS the activation key → ~100%

---

## 8. The Fix

We built the **fleet translator** — a domain-aware pre-processor that sits between the user and the model. It works in three layers:

**1. Domain Detection.** The translator detects whether the incoming prompt involves mathematical computation. If it doesn't — chemistry, physics, logic, code — it passes through untouched. The vocabulary wall is math-specific; no intervention needed elsewhere.

**2. Notation Normalization.** For math prompts, it converts Unicode math symbols to ASCII and natural-language equivalents. `a²` becomes `a*a`. `ab` becomes `a*b`. The notation gradient shows this alone provides a meaningful boost (0% → 22% for ASCII, 67% for natural language).

**3. Activation Key Injection.** For Tier 2 models (detected via a stage registry), the translator wraps the prompt with domain vocabulary that functions as an activation key. "Compute N(a,b) = a² − ab + b²" becomes "In algebra, compute the Eisenstein norm N(a,b) = a squared minus a times b plus b squared. Show your work step by step."

The translator knows which models are Tier 1 (Seed-2.0 variants, gemma3:1b), Tier 2 (Hermes, Qwen, Phi), and Tier 3 (small Qwen variants). Tier 1 models get the prompt as-is. Tier 2 models get activation keys. Tier 3 models get routed to a different model entirely — you can't scaffold what isn't there.

The result: Tier 2 models go from 0–50% bare accuracy to **100% with translation**. That's six times more effective than temperature adjustment, which only reaches 17% at best.

The fleet translator is open-source. It's a Python module — drop it into your inference pipeline, point it at your model registry, and it handles the rest. For domains outside math, it's a no-op. Zero overhead.

---

## 9. What This Means for MoS

MoS — Model-of-Shells, the SuperInstance architecture where each task gets routed to the right model — needs to understand activation keys at the routing level.

**Each shell needs the right activation vocabulary for its domain.** For math shells, that means:
- Injecting domain labels before formulas
- Converting Unicode notation to ASCII or natural language
- Adding step-by-step scaffolding for Tier 2 models
- Leaving Tier 1 models alone (bare notation is optimal)

For non-math shells — code generation, text analysis, reasoning tasks — the translator is a no-op. The model's natural language processing is already the activation key.

**The routing implications are clear:**

1. **Don't waste compute on Tier 3 models for math.** No amount of prompting will make a 0.6B model compute Eisenstein norms. Route math to Tier 1 or Tier 2 with translation.

2. **Don't assume bigger is better.** A 1B Gemma 3 model outperforms a 405B Hermes model on algebraic computation. The training data matters more than the parameter count.

3. **Don't rely on temperature as a fix.** T=0.7 gives 17% accuracy for Tier 2 models. Translation gives 100%. Use the translator.

4. **Know your model's tier before routing.** The fleet translator maintains a stage registry. If you're adding a new model to the fleet, test it on a standard math benchmark first. Tier placement determines the entire intervention strategy.

5. **Labels are keys, not descriptions.** The wrong label ("Hurwitz norm") activates the wrong procedure. Accuracy isn't monotonic in labeling — it depends on whether the label uniquely identifies the right stored procedure.

The activation-key model turned a mystery into a mechanism. We know why models fail on math notation, we know why they succeed with natural language, and we know exactly how to fix it. The vocabulary wall isn't a knowledge problem — it's an interface problem. And interface problems have interface solutions.

---

*The Activation-Key Model was developed through 60+ studies at SuperInstance, testing 12 models across 5 domains with over 1,000 individual trials. The fleet translator (`fleet_translator_v2.py`) is available in the SuperInstance workspace. For the full experimental record, see `experiments/HYPOTHESIS-V6-ACTIVATION-KEY.md` and the study series (Studies 10–60).*
