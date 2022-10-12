import { Reactive, ViewEntity3D, MathUtils, createElement } from '@turbox3d/turbox';
import { Circle } from '../helper/index';
import { RotatePointEntity } from '../../../models/entity/rotatePoint';
import { RenderOrder } from '../../../consts/scene';

interface IRotatePointProps {
  model: RotatePointEntity;
}

@Reactive
export class RotatePointViewEntity extends ViewEntity3D<IRotatePointProps> {
  protected reactivePipeLine = [
    this.updatePosition,
    this.updateRotation,
    this.updateScale
  ];

  render() {
    return [
      createElement(Circle, {
        radius: this.props.model.radius,
        imgUrl: 'https://img.alicdn.com/imgextra/i3/O1CN01Ekra8c1aK1gwa57wE_!!6000000003310-2-tps-200-200.png?x-oss-process=image/resize,w_60/format,webp',
        renderOrder: RenderOrder.CONTROL_POINT,
      }),
    ];
  }

  private updatePosition() {
    const { model } = this.props;
    this.view.position.set(
      model.position.x,
      model.position.y,
      model.position.z
    );
  }

  private updateRotation() {
    const { model } = this.props;
    this.view.rotation.set(
      model.rotation.x * MathUtils.DEG2RAD,
      model.rotation.y * MathUtils.DEG2RAD,
      model.rotation.z * MathUtils.DEG2RAD
    );
  }

  private updateScale() {
    const { model } = this.props;
    this.view.scale.set(model.scale.x, model.scale.y, model.scale.z);
  }
}
