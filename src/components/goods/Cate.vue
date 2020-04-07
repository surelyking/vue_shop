<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        class="treeTable"
        :data="catlist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效列 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen"></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>
        <!-- 排序列 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作列 -->
        <template slot="operation" slot-scope="scope">
          <!-- 修改按钮 -->
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditDialog(scope.row.cat_id)"
          >编辑</el-button>
          <!-- 删除按钮 -->
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeUserById(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps "
            @change="parentCateChanged"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
 <!-- 编辑分类对话框 -->
    <el-dialog title="修改商品分类" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 内容主题区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="分类名称" prop="cat_name" label-width="90px">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <el-form :model="editForm" :rules="editFormRules" label-width="70px">
        <el-form-item label="父级分类" prop="cat_pid" label-width="90px">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps "
            @change="parentCateChanged"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      catlist: [],
      total: 0,
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 表格的列定义属性
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'operation'
        }
      ],
      addDialogVisible: false,
      //添加分类的表单对象
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        // 分类等级默认是一级分类
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类列表
      parentCateList: [],
      // 父级选择器配置
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      editDialogVisible: false,
      editForm: {},
      editFormRules:{
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCatList()
  },
  methods: {
    async getCatList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      }

      this.catlist = res.data.result
      this.total = res.data.total
    },
    // 监听添加分类对话框
    showAddCateDialog() {
      this.getParentCateList()
      this.addDialogVisible = true
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCatList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCatList()
    },
    //点击按钮添加分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品分类失败!')
        }
        this.$message.success('添加商品分类成功!')
        this.getCatList()
        this.addDialogVisible = false
      })
    },
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级商品分类失败!')
      }
      this.parentCateList = res.data
    },
    //选择项发生变化触发这个函数
    parentCateChanged() {
      // 如果 selectedKeys 数组中的 length 大于0 ,证明选中了父级分类
      // 反之,就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        ;(this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]),
          (this.addCateForm.cat_level = this.selectedKeys.length)
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 关闭重置表单
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    async showEditDialog(id) {
      this.editDialogVisible = true
      console.log(id);
      const { data: res } = await this.$http.get(`categories/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类参数失败!')
      }
      this.editForm = res.data
    },
    // 点击按钮提交编辑后的用户信息
    editCateInfo() {

    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}

.el-cascader-menu {
  height: 300px;
}
</style>