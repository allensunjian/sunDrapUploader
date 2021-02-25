#### sunDrapUploader
功能：文件拖拽组件

实现接口：
- getFile 文件读取结束返回文件信息
- fileAreaEnter 文件进入拖拽区域
- fileAreaLeave 文件离开拖拽区域
- filePageEnter 文件进去拖拽页面（未进入拖拽区域）
- eventTirrger 错误回调函数

配置：

| 字段 |类型  |默认值  |功能  
| --- | --- | --- | --- | 
| target | string | null |  指定触发元素
| rules | object | {} |  定义文件验证规则
| errFileFilter| boolean | false |  是否开启文件验证过滤
| fileType| string | 'file' |  指定文件类型

rules 配置
| 字段 |类型  |默认值  |功能  
| --- | --- | --- | --- | 
| fileCount | number | infinit |  文件数量约束
| maxSize | number | infinit| 文件大小约束（最大值）单位: bit
| minSize| number | infinit |  文件大小约束（最小值）单位: bit
| fileType| Array | null |  文件类型约束

实例：
```
new sunDrapUploader（{
    target："drag",
    rules: {
        fileCount: 10,
        maxSize: 1024 * 1024,
        minSize: 10,
        fileType: ["doc", "docx", "pdf", "txt"]
    },
    errFileFilter: true,
    fileType: "file",
    getFile: function (files, count) {
        // files 文件， 开启了errFileFilter 之后 files返回一个对象
        // 包含 acrossFiles 字段（验证通过的 文件列表） verErrFiles 字段（验证未通过 文件列表）  //  files 说明见 【files字段说明】
    },
    fileAreaEnter: function () {
        // 进入拖放区域
    },
    fileAreaLeave: function () {
     // 离开拖放区域
    },
    filePageEnter: function () {
    // 进入拖拽页面（未进入拖放区域）
    },
    eventTirrger: function (err) {
        // 字段说明同 【errList字段说明】
        console.log(err);
        // 返回错误信息
    }

}）
```

files字段说明

| 字段 |类型  |默认值  |功能  
| --- | --- | --- | --- | 
| file | File | 无 |  文件
| fileName | string | 无| 文件名称
| fileSize| number | 无 |  文件大小 单位: bit
| fileType| string | 无 |  文件类型
| readedState| boolean | 无 |  文件读取是否成功
| verMsg| object | 无 |  文件验证信息对象

verMsg字段说明

| 字段 |类型  |默认值  |功能  
| --- | --- | --- | --- | 
| errList | Array | 无 |  文件验证错误信息
| verState | string | 无| 文件验证状态 2 通过 0 未通过 （未通过时 errList包含错误信息）

errList字段说明

| 字段 |类型  |默认值  |功能  
| --- | --- | --- | --- | 
| errList | Array | 无 |  文件验证错误信息
| errType | string | 无 |  文件错误类型同rules 配置
| rule | any | 无 |  定义的规则
| value | any | 无 |  文件的值（不符合 规则rule 的值）
