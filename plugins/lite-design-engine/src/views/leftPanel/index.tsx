/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-empty-interface */
import * as React from 'react';
import { Button, Slider } from 'antd';
import { ldeStore } from '../../models/index';
import './index.less';
import { Z_INDEX_ACTION, MIRROR_ACTION } from '../../consts/scene';
import { useMaterialDragAndReplace } from '../../hooks/index';
import { LoadSystem } from '@turbox3d/turbox3d';

const images = {
  wardrobe: 'https://img.alicdn.com/imgextra/i4/O1CN01ZA12421w82rWiH8mB_!!6000000006262-2-tps-420-545.png',
  sofa: 'https://img.alicdn.com/imgextra/i3/O1CN01MhP0fY2ALhI7PSOsW_!!6000000008187-2-tps-659-210.png',
  light: 'https://img.alicdn.com/imgextra/i1/O1CN01e75DXU1iaWsKBVhgB_!!6000000004429-2-tps-589-689.png',
  desk: 'https://img.alicdn.com/imgextra/i1/O1CN01fjx8yy1cEBrLvwjUC_!!6000000003568-2-tps-424-223.png',
  chair: 'https://img.alicdn.com/imgextra/i4/O1CN01VqO45D1Sv6ollGOQ0_!!6000000002308-2-tps-417-416.png',
  art: 'https://img.alicdn.com/imgextra/i1/O1CN01QySwn01V6g3SlsyOW_!!6000000002604-2-tps-392-584.png',
};

export function LeftPanel() {
  let isPressed = false;
  let timer: number;
  const { dragControl } = useMaterialDragAndReplace();
  const lockCamera = () => {
    ldeStore.scene.$update({
      cameraControlsEnabled: !ldeStore.scene.cameraControlsEnabled,
    });
  };

  const undoHandler = () => {
    ldeStore.document.undo();
  };

  const redoHandler = () => {
    ldeStore.document.redo();
  };

  const addCube = () => {
    ldeStore.actions.addCube();
  }

  const deleteModel = () => {
    ldeStore.actions.deleteEntity();
  }

  const updateZ = (type: Z_INDEX_ACTION) => () => {
    ldeStore.actions.updateRenderOrder(type);
  }

  const mirror = (type: MIRROR_ACTION) => () => {
    ldeStore.actions.updateMirror(type);
  }

  const copy = () => {
    ldeStore.actions.copy();
  }

  const scaleScene = (value: number) => {
    ldeStore.actions.scaleScene(value);
  }

  const lock = () => {
    ldeStore.actions.lock();
  }

  const replace = () => {
    const sofaUrl = 'https://img.alicdn.com/imgextra/i3/O1CN01MhP0fY2ALhI7PSOsW_!!6000000008187-2-tps-659-210.png';
    ldeStore.actions.replace(sofaUrl);
  }

  const group = () => {
    ldeStore.actions.group();
  }

  const screenShot = () => {
    ldeStore.actions.screenShot(true, 'image/jpeg', 1, 1);
  }

  const exportPDF = () => {
    ldeStore.actions.exportPDF();
  }

  const skew = () => {
    ldeStore.actions.skew();
  }

  const confirmSkew = () => {
    ldeStore.actions.confirmSkew();
  }

  const cancelSkew = () => {
    ldeStore.actions.cancelSkew();
  }

  const clip = () => {
    ldeStore.actions.clip();
  }

  const confirmClip = () => {
    ldeStore.actions.confirmClip();
  }

  const cancelClip = () => {
    ldeStore.actions.cancelClip();
  }

  const align = (type: 'top' | 'middle' | 'bottom') => () => {
    ldeStore.actions.align(type);
  }

  const setBackground = () => {
    ldeStore.actions.setBackground('https://img.alicdn.com/imgextra/i4/O1CN01G67W6k1QLizMprCEg_!!6000000001960-0-tps-2560-1440.jpg');
  }

  const save = () => {
    const json = ldeStore.actions.save({
      id: '123',
      spaceId: '123',
    });
    console.log(json);
  }

  const load = async () => {
    const json = await LoadSystem.loadJSON('https://ihomeimg.oss-cn-beijing.aliyuncs.com/i/m6orvirrfb8.json');
    ldeStore.actions.load(json);
  }

  // const swipeScene = (type: string) => () => {
  //   const dis = type === 'bottom' ? -100 : 0;
  //   (document.querySelector('#app canvas')! as any).style.transition = 'all .3s';
  //   (document.querySelector('#app2 canvas')! as any).style.transition = 'all .3s';
  //   (document.querySelector('#app canvas')! as any).style.transform = `translateY(${dis}%)`;
  //   (document.querySelector('#app2 canvas')! as any).style.transform = `translateY(${dis}%)`;
  // }

  const pointerDownHandler = (url: string, itemId: number | string) => (e: React.PointerEvent) => {
    e.persist();
    isPressed = false;
    // timer = window.setTimeout(() => {
    //   isPressed = true;
    //   dragControl.current.onMouseDown(url, itemId)(e);
    // }, 300);
    dragControl.current.onMouseDown(url)(e);
  }
  const pointerMoveHandler = () => {
    if (!isPressed) {
      window.clearTimeout(timer);
    }
  }

  const renderFlag = () => {
    ldeStore.scene.setRenderFlag3d(!ldeStore.scene.renderFlag3d);
  }

  const renderFlag2d = () => {
    ldeStore.scene.setRenderFlag2d(!ldeStore.scene.renderFlag2d);
  }

  return (
    <div className="left-panel">
      <div className="material">
        {Object.keys(images).map(key => (
          <div key={key} className="img-list" onPointerDown={pointerDownHandler(images[key], key)} onPointerMove={pointerMoveHandler}>
            <span>{key}</span>
            <img draggable={false} alt={key} title={key} src={images[key]} width={60} height={60} />
          </div>
        ))}
      </div>
      <div>
        {/* <Button type="primary" className="op" onClick={swipeScene('bottom')}>切换场景下</Button>
        <Button type="primary" className="op" onClick={swipeScene('top')}>切换场景上</Button> */}
        <Button type="primary" className="op" onClick={setBackground}>设为背景</Button>
        <Button type="primary" className="op" onClick={addCube}>添加立方体</Button>
        <Button type="primary" className="op" onClick={deleteModel}>删除选中模型</Button>
        <Button type="primary" className="op" onClick={updateZ(Z_INDEX_ACTION.TOP)}>置顶</Button>
        <Button type="primary" className="op" onClick={updateZ(Z_INDEX_ACTION.INCREASE)}>上移</Button>
        <Button type="primary" className="op" onClick={updateZ(Z_INDEX_ACTION.DECREASE)}>下移</Button>
        <Button type="primary" className="op" onClick={updateZ(Z_INDEX_ACTION.BOTTOM)}>置底</Button>
        <Button type="primary" className="op" onClick={mirror(MIRROR_ACTION.LEFT_RIGHT)}>左右镜像</Button>
        <Button type="primary" className="op" onClick={mirror(MIRROR_ACTION.TOP_BOTTOM)}>上下镜像</Button>
        <Button type="primary" className="op" onClick={skew}>形变</Button>
        <Button type="primary" className="op" onClick={confirmSkew}>确定形变</Button>
        <Button type="primary" className="op" onClick={cancelSkew}>取消形变</Button>
        <Button type="primary" className="op" onClick={clip}>裁剪</Button>
        <Button type="primary" className="op" onClick={confirmClip}>确定裁剪</Button>
        <Button type="primary" className="op" onClick={cancelClip}>取消裁剪</Button>
        <Button type="primary" className="op" onClick={copy}>复制</Button>
        <Button type="primary" className="op" onClick={lockCamera}>相机锁定/解锁</Button>
        <Button type="primary" className="op" onClick={lock}>锁定/解锁</Button>
        <Button type="primary" className="op" onClick={replace}>替换</Button>
        <Button type="primary" className="op" onClick={group}>组合/解组</Button>
        <Button type="primary" className="op" onClick={align('top')}>顶部对齐</Button>
        <Button type="primary" className="op" onClick={align('middle')}>中部对齐</Button>
        <Button type="primary" className="op" onClick={align('bottom')}>底部对齐</Button>
        <Slider defaultValue={1} min={0.1} max={2.8} step={0.1} onChange={scaleScene} />
        <Button type="primary" className="op" onClick={undoHandler}>Undo</Button>
        <Button type="primary" className="op" onClick={redoHandler}>Redo</Button>
        <Button type="primary" className="op" onClick={save}>保存</Button>
        <Button type="primary" className="op" onClick={load}>加载</Button>
        <Button type="primary" className="op" onClick={screenShot}>截图</Button>
        <Button type="primary" className="op" onClick={exportPDF}>导出pdf</Button>
        <Button type="primary" className="op" onClick={renderFlag}>renderFlag3d</Button>
        <Button type="primary" className="op" onClick={renderFlag2d}>renderFlag2d</Button>
      </div>
    </div>
  );
}