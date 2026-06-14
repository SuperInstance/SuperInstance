import type { WrappableAgent, WrappedAgent, AgentRole } from './types.js';
import type { Fleet } from './sdk.js';
/**
 * Wrap an OpenAI Agents SDK agent with conservation governance.
 *
 * ```typescript
 * import { wrapOpenAI } from 'superinstance';
 * const governed = wrapOpenAI(myOpenAIAgent, fleet, 'builder');
 * ```
 */
export declare function wrapOpenAI(agent: WrappableAgent, fleet: Fleet, role: AgentRole): WrappedAgent;
/**
 * Wrap a LangGraph graph/agent with conservation governance.
 *
 * ```typescript
 * import { wrapLangGraph } from 'superinstance';
 * const governed = wrapLangGraph(myGraph, fleet, 'researcher');
 * ```
 */
export declare function wrapLangGraph(graph: WrappableAgent, fleet: Fleet, role: AgentRole): WrappedAgent;
/**
 * Wrap a CrewAI crew with conservation governance.
 *
 * ```typescript
 * import { wrapCrewAI } from 'superinstance';
 * const governed = wrapCrewAI(myCrew, fleet, 'builder');
 * ```
 */
export declare function wrapCrewAI(crew: WrappableAgent, fleet: Fleet, role: AgentRole): WrappedAgent;
/**
 * Wrap any agent that has an `execute(task: string) => Promise<string>` method.
 *
 * ```typescript
 * import { wrapGeneric } from 'superinstance';
 * const governed = wrapGeneric(myCustomAgent, fleet, 'validator');
 * ```
 */
export declare function wrapGeneric(agent: WrappableAgent, fleet: Fleet, role: AgentRole): WrappedAgent;
