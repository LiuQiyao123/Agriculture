export const userList = [
  { id: 1, username: 'admin', realName: '刘启尧', department: '信息中心', role: '管理员', status: '正常', createTime: '2024-01-01' },
  { id: 2, username: 'analyst01', realName: '张三', department: '农业技术站', role: '分析员', status: '正常', createTime: '2024-02-15' },
  { id: 3, username: 'guest01', realName: '李四', department: '访客部门', role: '访客', status: '禁用', createTime: '2024-03-20' },
  { id: 4, username: 'analyst02', realName: '王五', department: '农业技术站', role: '分析员', status: '正常', createTime: '2024-04-01' },
];

export const permissionTree = [
  { id: 1, label: '综合态势大屏' },
  {
    id: 2,
    label: '数据资源中心',
    children: [{ id: 8, label: '自动化设备管理' }, { id: 9, label: '人工数据上报' }],
  },
  {
    id: 3,
    label: '智能分析决策',
    children: [
      { id: 4, label: '墒情监测与旱情分析' },
      { id: 5, label: '作物长势遥感监测' },
      { id: 6, label: '土地用途分析' },
      { id: 7, label: '耕地退化分析' },
    ],
  },
  {
    id: 10,
    label: '系统管理',
    children: [{ id: 11, label: '用户管理' }, { id: 12, label: '角色权限设置' }],
  }
];

export const rolePermissions = {
  '管理员': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  '分析员': [1, 2, 3, 4, 5, 6, 7, 8, 9],
  '访客': [1],
}; 