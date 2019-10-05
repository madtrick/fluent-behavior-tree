import BehaviorTreeStatus from "../BehaviorTreeStatus";
import BehaviorTreeError from "../Error/BehaviorTreeError";
import Errors from "../Error/Errors";
import StateData from "../StateData";
import BehaviorTreeNodeInterface from "./BehaviorTreeNodeInterface";
import ParentBehaviorTreeNodeInterface from "./ParentBehaviorTreeNodeInterface";

/**
 * Decorator node that inverts the success/failure of its child.
 *
 * @property {string} name - The name of the node
 */
export default class InverterNode<T> implements ParentBehaviorTreeNodeInterface<T> {
    /**
     * The child to be inverted
     */
    private childNode?: BehaviorTreeNodeInterface<T>;

    public constructor(public readonly name: string) {
    }

    public tick(state: StateData<T>): BehaviorTreeStatus {
        if (!this.childNode) {
            throw new BehaviorTreeError(Errors.INVERTER_NO_CHILDREN);
        }

        const result = this.childNode.tick(state);
        if (result === BehaviorTreeStatus.Failure) {
            return BehaviorTreeStatus.Success;
        } else if (result === BehaviorTreeStatus.Success) {
            return BehaviorTreeStatus.Failure;
        }

        return result;
    }

    public addChild(child: BehaviorTreeNodeInterface<T>): void {
        if (!!this.childNode) {
            throw new BehaviorTreeError(Errors.INVERTER_MULTIPLE_CHILDREN);
        }

        this.childNode = child;
    }
}
