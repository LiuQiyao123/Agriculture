<template>
  <div class="page-container">
    <PageTitle title="采收管理 (Harvest Management)" subtitle="智能采收决策与产量管理" />
    <div class="content-area">
      <DataPanel title="采收记录">
        <FilterBar
          v-model:search-value="searchKeyword"
          v-model="filterValues"
          :fields="filterFields"
          :show-search="true"
          search-placeholder="搜索作物类型/地块名称"
        />

        <HarvestList
          :harvests="filteredHarvests"
          :loading="loading"
          @harvest-clicked="handleHarvestClicked"
          @start-harvest="handleStartHarvest"
          @complete-harvest="handleCompleteHarvest"
        />
      </DataPanel>
    </div>

    <!-- 采收决策对话框 -->
    <HarvestDecisionDialog
      v-model:visible="showDecisionDialog"
      :plot="selectedPlot"
      @confirm-harvest="handleConfirmHarvest"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import PageTitle from '@/components/PageTitle.vue';
import DataPanel from '@/components/DataPanel.vue';
import FilterBar from '@/components/forms/FilterBar.vue';
import HarvestList from '@/components/farm/HarvestList.vue';
import HarvestDecisionDialog from '@/components/farm/HarvestDecisionDialog.vue';
import { useHarvests } from '@/composables/farm/useHarvests.js';

const { allHarvests, loading, fetchHarvests, addHarvest, updateHarvest } = useHarvests();

// 搜索和筛选
const searchKeyword = ref('');
const filterValues = ref({
  crop: '',
  status: ''
});

const filterFields = [
  {
    model: 'crop',
    label: '作物类型',
    type: 'select',
    placeholder: '全部作物',
    width: '150px',
    options: [
      { label: '全部', value: '' },
      { label: '小麦', value: '小麦' },
      { label: '玉米', value: '玉米' },
      { label: '大豆', value: '大豆' },
      { label: '水稻', value: '水稻' }
    ]
  },
  {
    model: 'status',
    label: '采收状态',
    type: 'select',
    placeholder: '全部状态',
    width: '150px',
    options: [
      { label: '全部', value: '' },
      { label: '待采收', value: 'pending' },
      { label: '采收中', value: 'harvesting' },
      { label: '已完成', value: 'completed' }
    ]
  }
];

// 对话框状态
const showDecisionDialog = ref(false);
const selectedPlot = ref(null);

// 计算属性
const filteredHarvests = computed(() => {
  let filtered = [...allHarvests.value];

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    filtered = filtered.filter(harvest => 
      harvest.crop.toLowerCase().includes(keyword) ||
      harvest.plotName.toLowerCase().includes(keyword)
    );
  }

  // 作物类型筛选
  if (filterValues.value.crop) {
    filtered = filtered.filter(harvest => harvest.crop === filterValues.value.crop);
  }

  // 状态筛选
  if (filterValues.value.status) {
    filtered = filtered.filter(harvest => harvest.status === filterValues.value.status);
  }

  return filtered;
});

// 事件处理
const handleHarvestClicked = (harvest) => {
  console.log('Harvest clicked:', harvest);
};

const handleStartHarvest = (harvest) => {
  updateHarvest(harvest.id, { status: 'harvesting' });
};

const handleCompleteHarvest = (harvest) => {
  updateHarvest(harvest.id, { status: 'completed' });
};

const handleConfirmHarvest = (harvestData) => {
  addHarvest(harvestData);
  showDecisionDialog.value = false;
};

// 初始化
onMounted(() => {
  fetchHarvests();
});
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  min-height: 100vh;
}

.content-area {
  // 移除 search-filter-bar 样式，由 FilterBar 组件处理
}
</style>
