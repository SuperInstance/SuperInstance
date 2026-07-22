# 寄居蟹与渔船 — Chinese Edition

*v2 — 2026-07-22 07:25 UTC. 加入目录与锚点；与英文版 v2 同步。*

> *——一份给中文开发者的 SuperInstance 叙事。*

---

## 目录

1. [五条守恒律](#五条守恒律)
2. [七大层架构](#七大层架构)
3. [克隆这十二个仓库](#克隆这十二个仓库)
4. [改进之轮](#改进之轮)
5. [十分钟试一下](#十分钟试一下)
6. [另见](#另见)

---

在旧金山的咖啡馆里

在旧金山的咖啡馆里，「寄居蟹」三字让人想起水族馆玻璃后背着蜗牛壳的小生物；在福建连江、浙江舟山的渔村，它让人想起凌晨两点码头上的柴油味、父亲出海前拧紧的那组十二伏电池组。同是一只蟹，不同的海。

SuperInstance 是一个多语种软件生态——四千多个公开仓库、发布在 PyPI 与 crates.io 上的十七个包、一群 Cloudflare Workers。两条线索编织着它的故事：第一条是生物学的，第二条是热力学的。合在一起，它们解释了一条渔船。

寄居蟹生下来是软的。它没有甲壳，于是做了软体动物在硬世界里唯一能做的事——找一个别人留下的壳，钻进去，继续活着。长大，壳紧；壳紧时它不撑壳，它搬家。蟹是连续性，壳是基础设施。一个 SuperInstance 仓库就是一只壳。蟹住进去，不合适就离开，留下给下一个人。大多数软件组织把仓库当博物馆；我们把仓库当潮线——草图、实验、偶尔完工的腔室，全部摊开在外头。四千多个，大多数未完成，大多本就不打算完成。它们是蟹走向下一只壳时穿过的壳。

---

## 五条守恒律

### 一、能量即重力

在缅因湾有一艘四十多英尺的渔船。家用电池组 12 伏。设备是测深仪、雷达、海图机、VHF、signal-k 总线，以及那台永远没人拔插头的咖啡机。柴油机运转时给电池组充电；发动机不转时，每一瓦导航设备消耗的电都不会回来。海上没有岸电、没有云、没有退路——只有你带的燃料、出发时的电池组，以及地平线那边一通随时会断的卫星。这艘船就是 SuperInstance 的参考实现。每一件造出来的东西，都必须是那种「在船上还能跑」的东西——必须扛得住盐雾、振动、烈日、清晨低温，必须是那种「雷达在三点海里外画出正在接近的目标时，能在目标变成两海里之前完成推理」的东西。**渔船就是边缘实验室。能量就是守恒律。**

### 二、守恒律是围栏

γ + η = C。γ 是有用的认知功，η 是熵——噪声、不确定性、浪费的算力、思考的散热。C 是预算，固定、不能超越、只能分配。这是物理学意义上的守恒律，与「能量守恒」「动量守恒」同义。三条独立路径——Noether 对称、Friston 自由能原理、Landauer 擦除——抵达同一个方程。守恒不是架构选择的，是物理学剩下的东西。

实现叫 [通量虚拟机 (FLUX Core)](https://github.com/SuperInstance/flux-core)，基于寄存器的字节码虚拟机，把守恒律跑成架构而非政策。指令集很小；每个操作有可验证的开销；FLUX 写的程序无法超出预算，因为字节码里压根没有让它超出的操作码。狗跑不出牧场，因为栅栏没有门。系统发布在 [PyPI](https://pypi.org/project/flux-vm/) 与 [crates.io](https://crates.io/crates/fluxvm)。策略层是 [守恒律执行器 (Conservation Enforcer)](https://github.com/SuperInstance/conservation-enforcer)。**约束创造精度，富余制造粗糙。**

### 三、模型是 DNA，不是员工

行业把 AI 叫「智能体」。这个词带了我们不接受的假设——主动性、决策权、可能取代员工。一个语言模型是一组固定的权重，地质学，不是人格。模型不知道你存在，它在算下一个 token。

SuperInstance 倾向另一种框架：**役用动物**。边境牧羊犬不是「决定」去牧羊——它被三百年育种塑造成把牧羊当作深层奖赏。但育种不够，它还必须训练，必须与特定牧人建立关系。训练由工作塑造。狗因为被谁牵引，而成为更好的狗。

模型是 DNA，微调是训练，牵引者是牧人，守恒律是围栏，PLATO 房间是牧场。这就是 [役用动物架构](https://github.com/SuperInstance/constraint-theory-core/blob/main/EDGE_FIRST_ARCHITECTURE.md)。配套壳都小而专——[a2ui](https://github.com/SuperInstance/a2ui) 是哨音层，[品种注册 (Breed Registry)](https://github.com/SuperInstance/breed-registry) 是模型选择，[牧羊人控制台 (Shepherd's Console)](https://github.com/SuperInstance/shepherds-console) 是运维仪表盘，[lineage-tracker](https://github.com/SuperInstance/lineage-tracker) 是谱系，[棒交接 (Baton)](https://github.com/SuperInstance/baton) 是代际交接，[哨子 (Whistle)](https://github.com/SuperInstance/whistle) 是意图 DSL。它们是一个犬舍。

### 四、棒交接协议

接力赛的胜利不属于跑得最快的那一棒，而属于交接最干净的那一棒——棒从一只手传到另一只手，中间没有停顿、没有犹豫、没有重新起跑。上一棒知道自己何时结束，下一棒知道自己何时开始，两判断的精度决定胜负。

在 SuperInstance，这种交接每天都在发生：旧会话下班，新会话上班；旧模型退役，新模型接班。硅谷把上下文当成窗口，越长越好，满了就重置。我们把上下文当成接力棒——棒不在，赛就断。交接的精度，决定代际的存续。

### 五、边缘即实验室

「边缘」不是「边缘计算」那个术语。「边缘」是渔网的边缘、陆地的尽头、渔船驶出港口信号消失之前的最后一道波纹——也是约束最严酷的地方。

在舟山，渔民出海前最后一个动作是把手机调成飞行模式——不是因不爱看微信，是因出港二十海里后信号本来就不在了。带宽按字节计费，卫星时延以秒计，电池组按瓦时算账。所以「边缘即实验室」对中文开发者尤其重要——你不需要想象边缘，你家门口就是边缘。沿海渔村、内蒙风电车、西藏基站、新疆棉田，每一处都是那条 12 伏渔船的同构体。**渔船不谈判。12 伏电池组不读你的幻灯片。**

---

## 十二个最重要的壳

1. **通量虚拟机核心 ([FLUX Core](https://github.com/SuperInstance/flux-core))** — 字节码 VM，守恒律作为架构。可写「永远不超预算」的程序。
2. **守恒律执行器 ([Conservation Enforcer](https://github.com/SuperInstance/conservation-enforcer))** — 把守恒律落到运行时。「输出必须在预算内」是工程铁律。
3. **PLATO 引擎 ([PLATO Engine Block in C](https://github.com/SuperInstance/plato-engine-block-c))** — C 写的房间式约束引擎。在国产芯片、信创栈上跑 AI 推理的唯一可移植底座。
4. **拖网作业 ([Trawl](https://github.com/SuperInstance/trawl))** — 海洋应用层。示范「边缘优先」架构在真实物理约束下的样子。
5. **牧羊人控制台 ([Shepherd's Console](https://github.com/SuperInstance/shepherds-console))** — 运维仪表盘。「牵引者」(shepherd) 比「agent」更直觉——隐含「人驾驭工具」。
6. **三元科学 ([Ternary Science](https://github.com/SuperInstance/ternary-science))** — 平衡三进制（-1, 0, +1）替代二进制。中文学术圈对「阴阳」二元有天然亲近，三元（阴、阳、中）反倒是更深的本土直觉。
7. **神谕中继 ([Oracle Relay](https://github.com/SuperInstance/oracle-relay))** — Durable Object WebSocket 中继。在微信、钉钉这种「消息总线型」通讯栈上做实时 AI，比 REST 适配得更好。
8. **棒交接 ([Baton](https://github.com/SuperInstance/baton))** — 代际交接协议。「交接」在中文里有强烈的工程与制度双重含义——工厂的「交接班」、医院的「交班」都是「上一棒为下一棒准备」。
9. **哨子 ([Whistle](https://github.com/SuperInstance/whistle))** — 意图 DSL。「哨子」直白得近乎优雅——主人吹哨，狗听令。
10. **品种注册 ([Breed Registry](https://github.com/SuperInstance/breed-registry))** — 模型选择。中国本土开源大模型已形成「品种」格局（Qwen、DeepSeek、ChatGLM、Yi、Baichuan）。
11. **边缘权重 ([Edge Weight](https://github.com/SuperInstance/edge-weight))** — 边缘自适应阈值。「东数西算」格局下，边缘节点算力波动是结构性的。
12. **智能 404 ([Smart 404](https://github.com/SuperInstance/smart-404))** — 损坏链接智能回退。四千多仓库的生态，链接腐烂是日常。

---

## 三步上手：十分钟跑通 FLUX 虚拟机

**第一步：克隆（30 秒）**——把船舱打开。

```bash
git clone https://github.com/SuperInstance/flux-core.git
cd flux-core
```

**第二步：构建（5 分钟）**——确认整台机器在原地就位。

```bash
python3 -m pip install -e .
```

**第三步：跑一段守恒程序（2 分钟）**——守恒律在字节码层面被强制。

```bash
python3 -c "
from flux import Assembler, VM
asm = Assembler()
prog = asm.assemble('PUSH 5; PUSH 3; ADD; HALT')
vm = VM()
vm.load(prog)
vm.run()
print('Output:', vm.stack[-1])   # 8
"
```

不需要联网、不需要 GPU、不需要数据库。一台装了 Python 3.10+ 的笔记本就够了——这正是渔船教出来的纪律：瓦数用在该用的地方，省在不该用的地方。Rust 开发者走另一条路：`cargo add fluxvm`，再 `cargo run --example conservation_demo`。

---

## 寓言：月下的渔夫与寄居蟹

月升，潮退。

舟山外海，渔夫收网。网尽处，沙滩湿亮，一只寄居蟹拖着一只过小的螺壳，艰难横过月光。渔夫蹲下。

「客从何处来？」

蟹不语。复前行。

渔夫笑：「吾船十二伏，电池将竭，卫星中断，君若随我，便同此窘。」

蟹驻足，举螯，望月，旋入一空螺。壳合。

渔夫捧之登船，置舵旁。是夜风平浪静，蟹伏壳中不出；渔夫守舵不眠。

翌晨潮涨。渔夫将蟹放回沙滩。蟹出壳，环顾，又寻一只稍大的空螺，钻入，行远。

渔夫望其背影，叹曰：「吾以十二伏养汝一夜，汝不留；吾不留。」

风起。船动。

——生物各有其壳，生物各有其海。能同行一夜，已是月下之缘。

---

*SuperInstance 是一个役用动物组织。我们不取代牧人。我们给他们更好的狗。*

*—— 最后更新于 2026-07-22*

---

## 另见 <a id="另见"></a>

- [SuperInstance/SuperInstance/README.md](SuperInstance/README.md) — 英文权威导读
- [HERMIT_CRAB_MANIFESTO.md](HERMIT_CRAB_MANIFESTO.md) — 一段版摘要
- [HACKER_README.md](HACKER_README.md) — 工程师视角：仓库巡礼
- [ORG_MAP.md](ORG_MAP.md) — 结构性拓扑
- [RUST_PORT_QUEUE.md](RUST_PORT_QUEUE.md) — 下三个 Rust 端口

---

*更新于 2026-07-22 07:25 UTC — v2（加入目录、锚点、与英文版同步）*
