<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="注意:只允许为第三级分类渲染相关参数!" type="warning" show-icon :closable="false"></el-alert>

      <!-- 选择器区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            expand-trigger="hover"
            :props="cateProps"
            @change="handleChange"
            clearable
            change-on-select
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisable"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableDate" border stripe>
            <!-- 这是展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable
                @close='handleClose(i,scope.row)' >{{item}}</el-tag>
                <!-- 循环渲染 tag 标签 -->
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 这是索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisable"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="onlyTableDate" border stripe>
            <!-- 这是展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable
                @close='handleClose(i,scope.row)' >{{item}}</el-tag>
                <!-- 循环渲染 tag 标签 -->
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 这是索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' +titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 验证表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑参数的对话框 -->
    <el-dialog
      :title="'编辑' +titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 验证表单 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      //级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //级联选择器双向绑定到的数组
      selectedCateKeys: [],
      // 被选中的页签的名称
      activeName: 'many',
      // 用于储存动态参数和静态参数的两个数组
      manyTableDate: [],
      onlyTableDate: [],
      addDialogVisible: false,
      editDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      //添加表单的验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 编辑参数的表单数据对象
      editForm: {},
      //编辑表单的验证规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
      // 控制按钮和文本框的切换显示
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error('获取数据分类列表失败!')
      }
      this.cateList = res.data
      console.log(this.cateList)
    },
    //级联选择框选中项变化,会触发这个函数
    handleChange() {
      this.getParamsDate()
    },
    handleTabClick() {
      console.log(this.activeName)
      this.getParamsDate()
    },
    async getParamsDate() {
      // 没有选中三级分类 要做清空
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableDate=[]
        this.onlyTableDate=[]
        return
      }
      // console.log(this.selectedCateKeys)
      //根据选中的id和所处的面板 获取对应的参数 id在计算属性中获得
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('获取分类参数失败!')
      }
      //将字符串数据更改成数组数据
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 给每一个 item 都添加这两个属性
        item.inputVisible = false
        item.inputValue = ''
      })

      if (this.activeName === 'many') {
        this.manyTableDate = res.data
      } else {
        this.onlyTableDate = res.data
      }
      console.log(res.data)
    },
    //点击按钮添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败!')
        }
        this.$message.success('添加参数成功!')
        this.getParamsDate()
        this.addDialogVisible = false
      })
      this.addDialogVisible = false
    },
    //监听对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 监听编辑对话框
    async showEditDialog(attr_id) {
      // 查询当前参数的对象
      const {
        data: res
      } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        { attr_sel: this.activeName }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('查询参数失败!')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('编辑参数失败!')
        }
        this.$message.success('编辑参数成功!')
        this.getParamsDate()
        this.editDialogVisible = false
      })
    },
    // 根据 id 删除对应的参数
    async removeParams(attr_id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      //用户取消了操作
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消操作!')
      }
      //删除用户的业务逻辑
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      )

      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败!')
      }
      this.$message.success('删除参数成功!')
      this.getParamsDate()
    },
    //文本框失去焦点和回车都会触发的事件
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //如果没有 return,则正面输入的内容需要后续的处理
      //输入的内容加入数组中
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      //发起请求 保存参数
      this.saveAttrVals(row)
    },
    async saveAttrVals(row){
      //发起请求 保存这次操作
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if(res.meta.status!==200){
        return this.$message.error('修改参数失败!')
      }
      this.$message.success('修改参数成功!')
    },
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      //$nextTick方法的作用,就是当页面上的元素被重新渲染了之后,才会执行回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    //删除对应的参数可选项
    handleClose(i,row){
      row.attr_vals.splice(i,1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    //如果按钮需要被禁用则返回true,否则返回false
    isBtnDisable() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    //当前选中的三级分类的id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-cascader {
  margin-left: 10px;
  width: 230px;
}
.el-tag {
  margin: 5px;
}
.input-new-tag {
  width: 92.88px;
}
</style>