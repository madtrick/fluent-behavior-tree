import Stack from "ts-data.stack";
import BehaviorTreeStatus from "./BehaviorTreeStatus";
import BehaviorTreeError from "./Error/BehaviorTreeError";
import Errors from "./Error/Errors";
import ActionNode from "./Node/ActionNode";
import BehaviorTreeNodeInterface from "./Node/BehaviorTreeNodeInterface";
import InverterNode from "./Node/InverterNode";
import ParallelNode from "./Node/ParallelNode";
import ParentBehaviorTreeNodeInterface from "./Node/ParentBehaviorTreeNodeInterface";
import SelectorNode from "./Node/SelectorNode";
import SequenceNode from "./Node/SequenceNode";
import StateData from "./StateData";

export default class BehaviorTreeBuilder<T> {
    /**
     * Last node created
     */
    private curNode?: BehaviorTreeNodeInterface<T>;

    /**
     * Stack node nodes that we are build via the fluent API.
     *
     * @type {Stack<ParentBehaviorTreeNodeInterface>}
     */
    private parentNodeStack: Stack<ParentBehaviorTreeNodeInterface<T>> =
        new Stack<ParentBehaviorTreeNodeInterface<T>>();

    /**
     * Create an action node.
     *
     * @param {string} name
     * @param {(state: StateData) => BehaviorTreeStatus} fn
     * @returns {BehaviorTreeBuilder}
     */
    public do(name: string, fn: (state: StateData<T>) => BehaviorTreeStatus): BehaviorTreeBuilder<T> {
        if (this.parentNodeStack.isEmpty()) {
            throw new BehaviorTreeError(Errors.UNNESTED_ACTION_NODE);
        }

        const actionNode = new ActionNode<T>(name, fn);
        this.parentNodeStack.peek().addChild(actionNode);

        return this;
    }

    /**
     * Like an action node... but the function can return true/false and is mapped to success/failure.
     *
     * @param {string} name
     * @param {(state: StateData) => boolean} fn
     * @returns {BehaviorTreeBuilder}
     */
    public condition(name: string, fn: (state: StateData<T>) => boolean): BehaviorTreeBuilder<T> {
        return this.do(name, (t) => fn(t) ? BehaviorTreeStatus.Success : BehaviorTreeStatus.Failure);
    }

    /**
     * Create an inverter node that inverts the success/failure of its children.
     *
     * @param {string} name
     * @returns {BehaviorTreeBuilder}
     */
    public inverter(name: string): BehaviorTreeBuilder<T> {
        return this.addParentNode(new InverterNode(name));
    }

    /**
     * Create a sequence node.
     *
     * @param {string}  name
     * @param {boolean} keepState
     * @returns {BehaviorTreeBuilder}
     */
    public sequence(name: string, keepState: boolean = true): BehaviorTreeBuilder<T> {
        return this.addParentNode(new SequenceNode(name, keepState));
    }

    /**
     * Create a parallel node.
     *
     * @param {string} name
     * @param {number} requiredToFail
     * @param {number} requiredToSucceed
     * @returns {BehaviorTreeBuilder}
     */
    public parallel(name: string, requiredToFail: number, requiredToSucceed: number): BehaviorTreeBuilder<T> {
        return this.addParentNode(new ParallelNode(name, requiredToFail, requiredToSucceed));
    }

    /**
     * Create a selector node.
     *
     * @param {string}  name
     * @param {boolean} keepState
     * @returns {BehaviorTreeBuilder}
     */
    public selector(name: string, keepState: boolean = true): BehaviorTreeBuilder<T> {
        return this.addParentNode(new SelectorNode(name, keepState));
    }

    /**
     * Splice a sub tree into the parent tree.
     *
     * @param {BehaviorTreeNodeInterface} subTree
     * @returns {BehaviorTreeBuilder}
     */
    public splice(subTree: BehaviorTreeNodeInterface<T>): BehaviorTreeBuilder<T> {
        if (this.parentNodeStack.isEmpty()) {
            throw new BehaviorTreeError(Errors.SPLICE_UNNESTED_TREE);
        }

        this.parentNodeStack.peek().addChild(subTree);

        return this;
    }

    /**
     * Build the actual tree
     * @returns {BehaviorTreeNodeInterface}
     */
    public build(): BehaviorTreeNodeInterface<T> {
            if (!this.curNode) {
                throw new BehaviorTreeError(Errors.NO_NODES);
            }

            return this.curNode;
    }

    /**
     * Ends a sequence of children.
     *
     * @returns {BehaviorTreeBuilder}
     */
    public end(): BehaviorTreeBuilder<T> {
        this.curNode = this.parentNodeStack.pop();

        return this;
    }

    /**
     * Adds the parent node to the parentNodeStack
     *
     * @param {ParentBehaviorTreeNodeInterface} node
     * @returns {BehaviorTreeBuilder}
     */
    private addParentNode(node: ParentBehaviorTreeNodeInterface<T>): BehaviorTreeBuilder<T> {
        if (!this.parentNodeStack.isEmpty()) {
            this.parentNodeStack.peek().addChild(node);
        }

        this.parentNodeStack.push(node);

        return this;
    }
}
