import { LogicGateComponent, enumLogicGateType } from "../components/logic_gate";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { BaseItem, enumItemType } from "../base_item";
import { enumPinSlotType } from "../components/wired_pins";
import { BOOL_TRUE_SINGLETON, BOOL_FALSE_SINGLETON, BooleanItem } from "../items/boolean_item";

export class LogicGateSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [LogicGateComponent]);

        this.boundOperations = {
            [enumLogicGateType.and]: this.compute_AND.bind(this),
            [enumLogicGateType.not]: this.compute_NOT.bind(this),
            [enumLogicGateType.xor]: this.compute_XOR.bind(this),
            [enumLogicGateType.or]: this.compute_OR.bind(this),
        };
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const logicComp = entity.components.LogicGate;
            const slotComp = entity.components.WiredPins;

            const slotValues = [];

            for (let i = 0; i < slotComp.slots.length; ++i) {
                const slot = slotComp.slots[i];
                if (slot.type !== enumPinSlotType.logicalAcceptor) {
                    continue;
                }
                if (slot.linkedNetwork) {
                    slotValues.push(slot.linkedNetwork.currentValue);
                } else {
                    slotValues.push(null);
                }
            }

            const result = this.boundOperations[logicComp.type](slotValues);

            // @TODO: For now we hardcode the value to always be slot 0
            assert(
                slotValues.length === slotComp.slots.length - 1,
                "Bad slot config, should have N acceptor slots and 1 ejector"
            );
            assert(slotComp.slots[0].type === enumPinSlotType.logicalEjector, "Slot 0 should be ejector");

            slotComp.slots[0].value = result;
        }
    }

    /**
     * @param {Array<BaseItem|null>} parameters
     * @returns {BaseItem}
     */
    compute_AND(parameters) {
        assert(parameters.length === 2, "bad parameter count for AND");

        const param1 = parameters[0];
        const param2 = parameters[1];
        if (!param1 || !param2) {
            // Not enough params
            return null;
        }

        const itemType = param1.getItemType();

        if (itemType !== param2.getItemType()) {
            // Differing type
            return BOOL_FALSE_SINGLETON;
        }

        if (itemType === enumItemType.boolean) {
            return /** @type {BooleanItem} */ (param1).value && /** @type {BooleanItem} */ (param2).value
                ? BOOL_TRUE_SINGLETON
                : BOOL_FALSE_SINGLETON;
        }

        return BOOL_FALSE_SINGLETON;
    }

    /**
     * @param {Array<BaseItem|null>} parameters
     * @returns {BaseItem}
     */
    compute_NOT(parameters) {
        const item = parameters[0];
        if (!item) {
            return BOOL_FALSE_SINGLETON;
        }

        if (item.getItemType() !== enumItemType.boolean) {
            // Not a boolean actually
            return BOOL_FALSE_SINGLETON;
        }

        const value = /** @type {BooleanItem} */ (item).value;
        return value ? BOOL_FALSE_SINGLETON : BOOL_TRUE_SINGLETON;
    }

    /**
     * @param {Array<BaseItem|null>} parameters
     * @returns {BaseItem}
     */
    compute_XOR(parameters) {
        assert(parameters.length === 2, "bad parameter count for XOR");

        const param1 = parameters[0];
        const param2 = parameters[1];
        if (!param1 || !param2) {
            // Not enough params
            return null;
        }

        const itemType = param1.getItemType();

        if (itemType !== param2.getItemType()) {
            // Differing type
            return BOOL_FALSE_SINGLETON;
        }

        if (itemType === enumItemType.boolean) {
            return /** @type {BooleanItem} */ (param1).value ^ /** @type {BooleanItem} */ (param2).value
                ? BOOL_TRUE_SINGLETON
                : BOOL_FALSE_SINGLETON;
        }

        return BOOL_FALSE_SINGLETON;
    }

    /**
     * @param {Array<BaseItem|null>} parameters
     * @returns {BaseItem}
     */
    compute_OR(parameters) {
        assert(parameters.length === 2, "bad parameter count for OR");

        const param1 = parameters[0];
        const param2 = parameters[1];
        if (!param1 || !param2) {
            // Not enough params
            return null;
        }

        const itemType = param1.getItemType();

        if (itemType !== param2.getItemType()) {
            // Differing type
            return BOOL_FALSE_SINGLETON;
        }

        if (itemType === enumItemType.boolean) {
            return /** @type {BooleanItem} */ (param1).value || /** @type {BooleanItem} */ (param2).value
                ? BOOL_TRUE_SINGLETON
                : BOOL_FALSE_SINGLETON;
        }

        return BOOL_FALSE_SINGLETON;
    }
}
