<template>
  <div class="kanban-board">
    <div v-for="column in columns" :key="column.id" class="kanban-column">
      <h3 class="column-title">{{ column.title }} ({{ getColumnItems(column.id).length }})</h3>
      <draggable
        class="item-list"
        :list="getColumnItems(column.id)"
        :group="group"
        item-key="id"
        @end="onDragEnd"
      >
        <template #item="{ element }">
          <div class="kb-card" :data-status="element[statusKey] || element.status">
            <div class="kb-card__body" @click="onItemClick(element)">
              <slot name="card" :item="element"></slot>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import draggable from 'vuedraggable';

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  group: {
    type: String,
    default: 'kanban-group',
  },
  itemKey: {
    type: String,
    default: 'id',
  },
  statusKey: {
    type: String,
    default: 'status',
  },
});

const emit = defineEmits(['item-moved', 'item-clicked']);

const getColumnItems = (statusId) => {
  return props.items.filter(item => item.status === statusId);
};

const onDragEnd = (event) => {
  const { to, item } = event;
  const columnElement = to.closest('.kanban-column');
  if (!columnElement) return;

  const columnTitle = columnElement.querySelector('.column-title').textContent.split(' ')[0];
  const newStatusId = props.columns.find(c => c.title === columnTitle)?.id;
  const itemId = item._underlying_vm_[props.itemKey];

  if (newStatusId && itemId) {
    emit('item-moved', { itemId, newStatusId });
  }
};

const onItemClick = (item) => {
  emit('item-clicked', item);
};
</script>

<style scoped lang="scss">
.kanban-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  height: 100%;
  padding: 10px;
  overflow-x: auto;
}

.kanban-column {
  background-color: $panel-bg-color;
  border: 1px solid $border-color;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 100%;
  padding: 10px;
}

.column-title {
  padding: 8px 4px 12px 4px;
  font-size: 16px;
  font-weight: 600;
  color: $title-color;
  border-bottom: 1px solid $border-color;
  flex-shrink: 0;
}

.item-list {
  padding: 10px 6px 4px 6px;
  flex-grow: 1;
  overflow-y: auto;
    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-thumb {
        background: $border-color;
        border-radius: 3px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
}

/* 统一卡片容器：只调亮卡片，不改列背景 */
.kb-card {
  background: linear-gradient(0deg, rgba(255,255,255,.14), rgba(255,255,255,.14)), $panel-bg-color;
  border: 1px solid rgba(255,255,255,.18);
  border-left: 6px solid $primary-accent-color;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,.25);
  transition: box-shadow .2s, background .2s;
  margin: 0 4px 12px 4px;
}
.kb-card:hover {
  background: linear-gradient(0deg, rgba(255,255,255,.18), rgba(255,255,255,.18)), $panel-bg-color;
  box-shadow: 0 6px 16px rgba(0,0,0,.35);
}
.kb-card__body {
  color: $text-color;
}

/* 状态色：左侧色条 + 轻薄状态罩层叠加在提亮卡片之上 */
.kb-card[data-status="suggested"] {
  border-left-color: $primary-accent-color;
  background: linear-gradient(0deg, rgba($primary-accent-color,.10), rgba($primary-accent-color,.10)),
              linear-gradient(0deg, rgba(255,255,255,.14), rgba(255,255,255,.14)), $panel-bg-color;
}
.kb-card[data-status="pending"] {
  border-left-color: $border-color;
  background: linear-gradient(0deg, rgba(255,255,255,.06), rgba(255,255,255,.06)),
              linear-gradient(0deg, rgba(255,255,255,.14), rgba(255,255,255,.14)), $panel-bg-color;
}
.kb-card[data-status="assigned"] {
  border-left-color: $secondary-accent-color;
  background: linear-gradient(0deg, rgba($secondary-accent-color,.10), rgba($secondary-accent-color,.10)),
              linear-gradient(0deg, rgba(255,255,255,.14), rgba(255,255,255,.14)), $panel-bg-color;
}
.kb-card[data-status="feedback"] {
  border-left-color: #E6A23C;
  background: linear-gradient(0deg, rgba(230,162,60,.12), rgba(230,162,60,.12)),
              linear-gradient(0deg, rgba(255,255,255,.14), rgba(255,255,255,.14)), $panel-bg-color;
}
.kb-card[data-status="completed"] {
  border-left-color: #a5d6a7;
  background: linear-gradient(0deg, rgba(165,214,167,.10), rgba(165,214,167,.10)),
              linear-gradient(0deg, rgba(255,255,255,.14), rgba(255,255,255,.14)), $panel-bg-color;
}
.kb-card[data-status="ignored"] {
  border-left-color: rgba(255,255,255,.20);
  background: linear-gradient(0deg, rgba(255,255,255,.04), rgba(255,255,255,.04)),
              linear-gradient(0deg, rgba(255,255,255,.14), rgba(255,255,255,.14)), $panel-bg-color;
}
.kb-card[data-status="archived"] {
  border-left-color: rgba(255,255,255,.25);
  background: linear-gradient(0deg, rgba(255,255,255,.05), rgba(255,255,255,.05)),
              linear-gradient(0deg, rgba(255,255,255,.14), rgba(255,255,255,.14)), $panel-bg-color;
}
</style>