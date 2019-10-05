import BehaviorTreeStatus from "../BehaviorTreeStatus";
import StateData from "../StateData";

export default interface BehaviorTreeNodeInterface<T> {
    tick(state: StateData<T>): BehaviorTreeStatus;
}
