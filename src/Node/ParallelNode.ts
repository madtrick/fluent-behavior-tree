import BehaviorTreeStatus from "../BehaviorTreeStatus";
import StateData from "../StateData";
import BehaviorTreeNodeInterface from "./BehaviorTreeNodeInterface";
import ParentBehaviorTreeNodeInterface from "./ParentBehaviorTreeNodeInterface";

/**
 * Runs child's nodes in parallel.
 *
 * @property {string} name                 - The name of the node.
 * @property {number} requiredToFail    - Number of child failures required to terminate with failure.
 * @property {number} requiredToSucceed - Number of child successes required to terminate with success.
 */
export default class ParallelNode<T> implements ParentBehaviorTreeNodeInterface<T> {
    /**
     * List of child nodes.
     *
     * @type {BehaviorTreeNodeInterface[]}
     */
    private children: Array<BehaviorTreeNodeInterface<T>> = [];

    public constructor(
        public readonly name: string,
        public readonly requiredToFail: number,
        public readonly requiredToSucceed: number,
    ) {
    }

    public tick(state: StateData<T>): BehaviorTreeStatus {
        const statuses: BehaviorTreeStatus[] = this.children.map((c) => this.tickChildren(state, c));
        const succeeded                      = statuses.filter((x) => x === BehaviorTreeStatus.Success).length;
        const failed                         = statuses.filter((x) => x === BehaviorTreeStatus.Failure).length;

        if (this.requiredToSucceed > 0 && succeeded >= this.requiredToSucceed) {
            return BehaviorTreeStatus.Success;
        }
        if (this.requiredToFail > 0 && failed >= this.requiredToFail) {
            return BehaviorTreeStatus.Failure;
        }

        return BehaviorTreeStatus.Running;
    }

    public addChild(child: BehaviorTreeNodeInterface<T>): void {
        this.children.push(child);
    }

    private tickChildren(state: StateData<T>, child: BehaviorTreeNodeInterface<T>): BehaviorTreeStatus {
        try {
            return child.tick(state);
        } catch (e) {
            return BehaviorTreeStatus.Failure;
        }
    }
}
