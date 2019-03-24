//创建一个模板编译工具
class TemplateCompiler{
  //构造函数
  //    1)视图线索（可能是选择器）
  //    2)全局vm对象
  constructor(el,vm){
    //缓存重要的属性
    this.el=this.isElementNode(el)?el:document.querySelector(el);
    this.vm=vm;
    //判断视图是否存在
        //1.把模板放入内存（片段）
        var fragment=this.node2fragment(this.el);
        //2.解析模板
        this.compile(fragment);
        //3.把内存结果返回页面
        this.el.appendChild(fragment);
  }


//***********************************工具方法 ********************/
isElementNode(node){
  return node.nodeType===1;//1.元素节点  2.属性节点  3.文本节点
}
isTextNode(node){
  return node.nodeType===3;//1.元素节点  2.属性节点  3.文本节点
}
toArray(fakeArr){
  return [].slice.call(fakeArr);
}
isDirective(attrName){//v-text
  return attrName.indexOf("v-")>=0;//判断属性名是否有“v-”开头的
}

//***********************************核心方法 ********************/
//把模板放入内存，等待解析
node2fragment(node){
    //1.创建内存片段
    var fragment=document.createDocumentFragment(),child;
    //2.把模板内容丢到内存
    while(child=node.firstChild){
      fragment.appendChild(child);
    }
    //3.返回
    return fragment;
}
compile(parent){
  //1.获取子节点
  var childNodes=parent.childNodes,
      compiler=this;
  //2.遍历每一个节点
   this.toArray(childNodes).forEach((node)=>{
  //3.判断节点类型
  if(compiler.isElementNode(node)){//1)属性节点（解析指令）
     compiler.compileElement(node);
  }
  else{ //2)文本节点（解析表达式）
    //定义文本表达式验证规则
    var expr=node.textContent;
    var reg=/\{\{(.+)\}\}/;//{{message}}
    if(reg.test(expr)){
      expr=RegExp.$1;
      compiler.compileText(node,expr);
    }
  }
     
    

  //*4）如果还有子节点，继续解析（递归）
   })

}
//解析元素节点的指令的
compileElement(node){
  //1.获取当前元素节点的所有属性
  var arrs=node.attributes,
      compiler=this;
     
  //2.遍历当前元素的所有属性
  this.toArray(arrs).forEach(attr=>{
    var attrName=attr.name;
     //3.判断属性是否是指令
     if(compiler.isDirective(attrName)){
        //4.收集
           //指令类型
        var type = attrName.substr(2);//v-text、v-model
           //指令的值就是表达式
        var expr = attr.value;
        //5.找帮手
        
        CompilerUtils[type](node,compiler.vm,expr);
     }
  })

}
//解析表达式的
compileText(node,expr){
    CompilerUtils.text(node,this.vm,expr);
}
//************************************* */
}
//帮手
CompilerUtils={
  //解析text指令
   text(node,vm,expr){
       //1.找到更新方法
       var updaterFn=this.updater['textUpdater'];
       //2.执行方法
       updaterFn && updaterFn(node,vm.$data[expr]);
   },
   //解析model指令
   model(node,vm,expr){
       //1.找到更新方法
       var updaterFn=this.updater['modelUpdater'];
       //2.执行方法
       updaterFn && updaterFn(node,vm.$data[expr]);
   },
   //更新规则对象
   updater:{
     //文本更新函数
     textUpdater(node,value){
       node.textContent=value;
     },
     //model更新函数
     modelUpdater(node,value){
       node.value=value;
     }
   }
}