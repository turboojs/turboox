/* eslint-disable @typescript-eslint/member-ordering */
import {
  BaseCommand,
  Action,
  IViewEntity,
  SceneEvent,
  Vec3,
  Vector3,
  ITool,
  MathUtils,
  EntityObject,
  IGesturesExtra,
} from '@turbox3d/turbox';
import { ProductEntity } from '../../../models/entity/product';
import { appCommandBox } from '../../index';
import { EntityCategory } from '../../../utils/category';
import { RotatePointSymbol, AdjustPointSymbol } from '../../../consts/scene';
import { scaleAndRotateAction } from '../scale/index';

export class RotateCommand extends BaseCommand {
  private target?: ProductEntity;
  private initPosition?: Vector3;
  private initRotation = 0;
  private degree = 0;

  protected onDragStart(viewEntity: IViewEntity, event: SceneEvent, tools: ITool) {
    scaleAndRotateAction.statusFlag.rotate = true;
    const selected = appCommandBox.defaultCommand.select.getSelectedEntities()[0];
    if ((viewEntity.type === RotatePointSymbol || viewEntity.type === AdjustPointSymbol) && EntityCategory.isProduct(selected) && !selected.locked) {
      this.target = selected;
      const ip = event.getScenePosition(this.target.position.z) as Vec3;
      this.initPosition = new Vector3(ip.x, ip.y, ip.z).applyMatrix4(this.target.getConcatenatedMatrix().inverted());
    }
  }

  protected onDragMove(viewEntity: IViewEntity, event: SceneEvent, tools: ITool) {
    if (!this.target || !this.initPosition) {
      return;
    }
    const sp = event.getScenePosition(this.target.position.z) as Vec3;
    const localPoint = new Vector3(sp.x, sp.y, sp.z).applyMatrix4(this.target.getConcatenatedMatrix().inverted());
    const degree = this.initPosition.clone().angleTo(localPoint, new Vector3(0, 0, 1)) * MathUtils.RAD2DEG;
    this.degree = degree;
    const { snapped } = this.snap(this.target!.rotation.z + degree);
    scaleAndRotateAction.action.execute(() => {
      this.target?.setRotation({
        z: this.target!.rotation.z + degree % 360,
      });
      this.target?.$update({
        snapped,
      });
    }, undefined, true, { immediately: true });
  }

  protected onDragEnd(viewEntity: IViewEntity, event: SceneEvent, tools: ITool) {
    scaleAndRotateAction.statusFlag.rotate = false;
    if (!this.target || !this.initPosition) {
      scaleAndRotateAction.action.abort();
      scaleAndRotateAction.action = Action.create('scaleAndRotateProduct');
    } else {
      const degree = this.degree;
      const { rotationZ } = this.snap(this.target!.rotation.z + degree);
      scaleAndRotateAction.action.execute(() => {
        this.target?.setRotation({
          z: rotationZ,
        });
        this.target?.$update({
          snapped: false,
        });
      }, undefined, true, { immediately: true });
      // console.log('rotate', scaleAndRotateAction.statusFlag);
      if (!scaleAndRotateAction.statusFlag.scale && !scaleAndRotateAction.statusFlag.rotate) {
        scaleAndRotateAction.action.complete();
        scaleAndRotateAction.action = Action.create('scaleAndRotateProduct');
      }
    }
    this.target = undefined;
    this.degree = 0;
  }

  private snap(degree: number) {
    let rotationZ = degree % 360;
    let snapped = false;
    const baseLine = 90;
    const snapDegree = 15;
    if ((Math.abs(rotationZ % baseLine) <= snapDegree)) {
      rotationZ = Math.floor(rotationZ / baseLine) * baseLine;
      snapped = true;
    } else if (Math.abs(rotationZ % baseLine) >= baseLine - snapDegree) {
      rotationZ = Math.ceil(rotationZ / baseLine) * baseLine;
      snapped = true;
    }
    return {
      rotationZ,
      snapped,
    };
  }

  protected onRotateStart(viewEntity: IViewEntity, event: SceneEvent) {
    scaleAndRotateAction.statusFlag.rotate = true;
    const selected = appCommandBox.defaultCommand.select.getSelectedEntities()[0];
    const target = EntityObject.getEntityById(viewEntity.id) as ProductEntity;
    if (selected && selected.id === EntityObject.getEntityById(viewEntity.id)?.getRoot().id && (EntityCategory.isProduct(selected) || EntityCategory.isAssembly(selected))) {
      if (!selected.locked) {
        this.target = target;
        this.initRotation = this.target.rotation.z;
      }
    }
  }

  protected onRotate(viewEntity: IViewEntity, event: SceneEvent) {
    if (!this.target) {
      return;
    }
    scaleAndRotateAction.action.execute(() => {
      const degree = (event.extra as IGesturesExtra)?.rotate || 0;
      this.degree = degree;
      const { snapped } = this.snap(this.initRotation + degree);
      this.target?.setRotation({
        z: this.initRotation + degree % 360,
      });
      this.target?.$update({
        snapped,
      });
    }, undefined, true, { immediately: true });
  }

  protected onRotateEnd(viewEntity: IViewEntity, event: SceneEvent) {
    scaleAndRotateAction.statusFlag.rotate = false;
    if (!this.target) {
      scaleAndRotateAction.action.abort();
      scaleAndRotateAction.action = Action.create('scaleAndRotateProduct');
    } else {
      scaleAndRotateAction.action.execute(() => {
        const degree = this.degree;
        const { rotationZ } = this.snap(this.initRotation + degree);
        this.target?.setRotation({
          z: rotationZ,
        });
        this.target?.$update({
          snapped: false,
        });
      }, undefined, true, { immediately: true });
      // console.log('rotate2', scaleAndRotateAction.statusFlag);
      if (!scaleAndRotateAction.statusFlag.scale && !scaleAndRotateAction.statusFlag.rotate) {
        scaleAndRotateAction.action.complete();
        scaleAndRotateAction.action = Action.create('scaleAndRotateProduct');
      }
    }
    this.target = undefined;
    this.degree = 0;
  }
}
