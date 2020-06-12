import { ctx } from '../const/config';
import { store, actionTypeChain } from '../core/store';
import { CURRENT_MATERIAL_TYPE, EMPTY_ACTION_NAME } from '../const/symbol';
import { bind, convert2UniqueString, includes } from '../utils/common';
import { Effect, EMaterialType, BabelDescriptor } from '../interfaces';
import { invariant } from '../utils/error';
import { quacksLikeADecorator } from '../utils/decorator';
import { materialCallStack } from '../core/domain';
import { triggerCollector } from '../core/collector';
import { TimeTravel } from '../core/time-travel';

interface EffectConfig {
  name: string;
}

/**
 * @todo: enhance effect feature, such as takeLead, takeLast
 */
function createEffect(target: Object, name: string | symbol | number, original: any, config: EffectConfig) {
  const stringMethodName = convert2UniqueString(name);
  return async function (...payload: any[]) {
    this[CURRENT_MATERIAL_TYPE] = EMaterialType.EFFECT;
    materialCallStack.push(this[CURRENT_MATERIAL_TYPE]);
    await store.dispatch({
      name: stringMethodName,
      displayName: config.name || EMPTY_ACTION_NAME,
      payload,
      type: EMaterialType.EFFECT,
      domain: this,
      original: bind(original, this) as Effect
    });
    materialCallStack.pop();
    const length = materialCallStack.length;
    this[CURRENT_MATERIAL_TYPE] = materialCallStack[length - 1] || EMaterialType.DEFAULT;
    if (ctx.timeTravel.isActive && (!TimeTravel.freeze && !includes(materialCallStack, EMaterialType.EFFECT))) {
      triggerCollector.save(actionTypeChain);
      triggerCollector.endBatch();
    }
  };
}

export function effect(target: Object, name: string | symbol | number, descriptor?: BabelDescriptor<any>): any;
export function effect(name?: string): (target: Object, name: string | symbol | number, descriptor?: BabelDescriptor<any>) => any;
/**
 * decorator @effect, handle some async process and effect.
 */
export function effect(...args: any[]) {
  const config: EffectConfig = {
    name: '',
  };
  const decorator = (target: Object, name: string | symbol | number, descriptor?: BabelDescriptor<any>): any => {
    // typescript only: @effect method = async () => {}
    if (descriptor === void 0) {
      let effectFunc: Function;
      Object.defineProperty(target, name, {
        enumerable: true,
        configurable: true,
        get: function () {
          return effectFunc;
        },
        set: function (original) {
          effectFunc = createEffect(target, name, original, config);
        },
      });
      return;
    }

    // babel/typescript: @effect method() {}
    if (descriptor.value !== void 0) {
      const original: Effect = descriptor.value;
      descriptor.value = createEffect(target, name, original, config);
      return descriptor;
    }

    // babel only: @effect method = () => {}
    const { initializer } = descriptor;
    descriptor.initializer = function () {
      invariant(!!initializer, 'The initializer of the descriptor doesn\'t exist, please compile it by using babel and correspond decorator plugin.');

      return createEffect(target, name, initializer && initializer.call(this), config);
    };

    return descriptor;
  }

  if (quacksLikeADecorator(args)) {
    // @effect
    return decorator.apply(null, args as any);
  }
  // @effect(args)
  config.name = args[0] || '';

  return decorator;
}
