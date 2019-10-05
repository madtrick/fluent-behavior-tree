import BehaviorTreeNodeInterface from "./BehaviorTreeNodeInterface";

export default interface ParentBehaviorTreeNodeInterface<T> extends BehaviorTreeNodeInterface<T> {
    /**
     * Add a child node to the selector.
     *
     * @param {BehaviorTreeNodeInterface} child
     */
    addChild(child: BehaviorTreeNodeInterface<T>): void;
}
