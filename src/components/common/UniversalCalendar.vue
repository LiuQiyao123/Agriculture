<template>
  <div class="universal-calendar-container">
    <VCalendar
      :attributes="attributes"
      :is-dark="true"
      expanded
      title-position="left"
      @dayclick="onDayClick"
    >
      <template #day-popover="{ day, attributes }">
        <div class="popover-content">
          <div class="popover-header">{{ day.ariaLabel }}</div>
          <div v-for="attr in attributes" :key="attr.key" class="popover-event-item" @click="onEventClick(attr.customData)">
            <div class="event-dot" :style="{ backgroundColor: attr.dot.color }"></div>
            <div class="event-title">{{ attr.customData.title }}</div>
          </div>
        </div>
      </template>
    </VCalendar>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';
import 'v-calendar/style.css';

const props = defineProps({
  events: {
    type: Array,
    required: true,
    default: () => []
  }
});

const emit = defineEmits(['day-click', 'event-click']);

const attributes = computed(() => {
  return props.events.map(event => ({
    key: event.id,
    dot: {
      color: event.color || 'blue',
    },
    dates: {
      start: new Date(event.startDate),
      end: new Date(event.endDate)
    },
    popover: true,
    customData: event,
  }));
});

const onDayClick = (day) => {
  emit('day-click', day);
};

const onEventClick = (event) => {
  emit('event-click', event);
}
</script>

<style lang="scss">
.universal-calendar-container {
  height: 100%;
  width: 100%;

  // v-calendar dark theme overrides to match our system theme
  .vc-container.vc-is-dark {
    background-color: $bg-color;
    border-color: $border-color;

    .vc-header {
      .vc-title {
        color: $title-color;
      }
      .vc-arrow, .vc-nav-item {
        color: $text-color;
        &:hover {
          background-color: $panel-bg-color;
        }
      }
    }

    .vc-weekday {
      color: $text-color-secondary;
    }

    .vc-day {
      color: $text-color;
      &:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }
      &.is-today {
        .vc-day-content {
           background-color: $primary-color;
           color: #fff;
        }
      }
    }
     .vc-day-content:focus {
        background-color: $panel-bg-color;
    }

    .vc-highlight {
      background-color: rgba($primary-color, 0.2);
    }

    .vc-dot {
       background-color: $primary-color;
    }
  }
}

// Popover specific styles
.popover-content {
  .popover-header {
    font-weight: 600;
    padding: 8px 12px;
    border-bottom: 1px solid #e0e0e0;
  }
  .popover-event-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s;
    &:hover {
      background-color: #f0f0f0;
    }

    .event-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 8px;
    }
    .event-title {
      font-size: 14px;
    }
  }
}
</style>