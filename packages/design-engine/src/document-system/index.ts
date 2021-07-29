import { config, Domain, mutation, reactor, TimeTravel, HistoryOperationType, Action } from '@turbox3d/reactivity';
import EntityObject from '../entity-object/index';

export default class DocumentSystem extends Domain {
  @reactor() models: Map<string, EntityObject> = new Map();

  @reactor(false, false) loading = false;

  @reactor(false, false) undoable = false;

  @reactor(false, false) redoable = false;

  @reactor(false, false) disableUndoRedo = false;

  history?: TimeTravel;

  maxStepNumber = 20;

  initDomainContext() {
    return {
      isNeedRecord: true,
    };
  }

  /** 添加模型 */
  @mutation
  addModel(model: EntityObject) {
    if (this.models.has(model.id)) {
      return;
    }
    this.models.set(model.id, model);
  }

  /** 根据 id 删除模型 */
  @mutation
  removeModelById(id: string) {
    this.models.delete(id);
  }

  /** 清空所有模型 */
  @mutation
  clear() {
    this.models.clear();
  }

  /** 根据 id 查找模型 */
  findModelById(id: string) {
    return this.models.get(id);
  }

  /** 创建操作历史记录 */
  createHistory(maxStepNumber = 20) {
    this.maxStepNumber = maxStepNumber;
    if (this.history) {
      return;
    }
    config({
      timeTravel: {
        isActive: true,
        maxStepNumber,
      },
    });
    this.history = TimeTravel.create();
    TimeTravel.switch(this.history);
    this.history.onChange = (undoable, redoable, type, action) => {
      this.updateTimeTravelStatus(undoable, redoable);
      this.historyChangeCustomHook(type, action);
    };
  }

  /** 历史记录变更会触发的自定义钩子，子类可以重写 */
  historyChangeCustomHook(type: HistoryOperationType, action?: Action) {
    //
  }

  /** 清空历史记录 */
  clearHistory() {
    if (!this.history) {
      return;
    }
    TimeTravel.switch(this.history);
    TimeTravel.clear();
  }

  /** 暂停记录历史 */
  pauseRecord() {
    if (!this.history) {
      return;
    }
    TimeTravel.switch(this.history);
    TimeTravel.pause();
  }

  /** 继续记录历史 */
  resumeRecord() {
    if (!this.history) {
      return;
    }
    TimeTravel.switch(this.history);
    TimeTravel.resume();
  }

  /** 撤销 */
  undo() {
    if (this.disableUndoRedo) {
      return;
    }
    if (!this.history || !this.undoable) {
      return;
    }
    TimeTravel.switch(this.history);
    this.history.undo();
  }

  /** 重做 */
  redo() {
    if (this.disableUndoRedo) {
      return;
    }
    if (!this.history || !this.redoable) {
      return;
    }
    TimeTravel.switch(this.history);
    this.history.redo();
  }

  /** 切换应用到当前历史记录 */
  applyHistory() {
    if (!this.history) {
      return;
    }
    TimeTravel.switch(this.history);
  }

  /** 文档加载状态设置为加载中 */
  @mutation
  isLoading() {
    this.loading = true;
  }

  /** 文档加载状态设置为加载完成 */
  @mutation
  isLoaded() {
    this.loading = false;
  }

  /** 自动保存 */
  protected async autoSave() {
    //
  }

  /** 恢复文档 */
  protected async restore() {
    //
  }

  /** 载入文档 */
  protected async load() {
    //
  }

  /** 保存文档 */
  protected async save() {
    //
  }

  @mutation
  private updateTimeTravelStatus(undo = false, redo = false) {
    this.undoable = undo;
    this.redoable = redo;
  }
}
