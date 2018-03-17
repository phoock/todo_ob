(function($) {

    var myTodo = (function(){
        function myTodo(element,options){
            this.element = element;
            this.options = $.extend($.fn.myTodo.default,options||{});
            this.init_dom_base();
        }
        myTodo.prototype = {
            //插入基本的dom结构
            init_dom_base:function(){
                var me = this;
                var DomHtml =
                    '<h1>'+me.options.h1+'</h1>' +
                    '<form class="add-task clearfix">' +
                    '<input type="text" name="content" value="" placeholder="'+me.options.placeholder+'" autofocus autocomplete="off">' +
                    '<button type="submit">submit</button>' +
                    '</form>' +
                    '<div class="task-list">' +
                    '</div>' +
                    '<dic class="task-detail-mask"></dic>' +
                    '<div class="task-detail">' +
                    '</div>' +
                    '<button class="reset right">reset</button>' +
                    '<button class="done left">done</button>'
                ;
                me.element.append(DomHtml);
                me._initDomSelector()
                  ._initList()
                  ._bindAddTaskEvent()
                  ._bindResetDone()
                  ._bindListFn()
                  ;

            },
            _initDomSelector:function(){
                var me = this;
                me.task_list=store.get('task_list') || [];
                me.$add_task = me.element.find('.add-task');
                me.$add_content = me.$add_task.find('[name=content]');
                me.$reset = me.element.find('.reset');
                me.$done = me.element.find('.done');
                me.$list = me.element.find('.task-list');
                me.$detail_mask = me.element.find('.task-detail-mask');
                me.$detail = me.element.find('.task-detail');

                return me;
            },
            _initList:function(){
                var me = this;
                if(me.task_list.length>0){
                    me.refresh_list();
                }
                return me;
            },
            _bindAddTaskEvent:function(){
                var me = this;
                me.$add_task.on('submit',function(e){
                    e.preventDefault();
                    var inputVal = me.$add_content.val();
                    var date = new Date();
                    var dateToLocao = date.toLocaleDateString().replace(/\//g,'-');
                    var dateToLocao = me.fixedDate(dateToLocao);
                    //匹配非空格的任意字符
                    if(!/\S+/.exec(inputVal)) return;
                    var data = {
                        content:inputVal,
                        date:dateToLocao,
                        checked:false,
                        areaHolder:'添加备注',
                        desc:""
                    }
                    me.task_list.push(data);
                    me.$add_content.val(null);
                    console.log($('.container').data('myTodo'))
                    me.update_store();
                    me.refresh_list();
                })
                return me;
            },
            _bindResetDone:function(){
                var me = this;
                me.$reset.on('click',function(e){
                    e.preventDefault();
                    if(confirm('是否重置所有项目？')){
                        store.clearAll();
                        me.task_list=[];
                    }
                    me.refresh_list();
                })
                me.$done.on('click',function(e){
                    e.preventDefault();
                    me.refresh_list();
                })
                return me;
            },



            //list上的3个按钮事件
            _bindListFn:function(){
                var me = this;
                me.$list.on('click','input[type=checkbox]',function(e){
                    var $this = $(this);
                    var index=me.getDataIndex($this);
                    me.changeChecked(index,$this);
                })
                me.$list.on('click','.delete',function(e){
                    var $this = $(this);
                    var index=me.getDataIndex($this);
                    me.deleteList(index);
                })
                me.$list.on('click','.detail',function(){
                    var $this = $(this);
                    var index=me.getDataIndex($this);
                    me.pop(index);
                })
                return me
            },
            changeChecked:function(index,$ele){
                var me = this;
                var data = {}
                if($ele.is(':checked')){
                    data = {
                        checked:true
                    }
                }else{
                    data = {
                        checked:false
                    }
                }
                me.updata_TaskList(index,data);
            },
            deleteList:function(index){
                var me = this;
                if(confirm("确定要删除吗？")){
                    delete me.task_list[index];
                    me.refresh_list()
                }
            },
            pop:function(index){
                var me = this;
                me.$detail_mask.on({
                    click:function(){
                        me.$detail.hide();
                        me.$detail_mask.hide();
                    }
                })
                me.renderDetail(index);
                me.$detail.show();
                me.$detail_mask.show();
            },





            //其他共有方法
            getDataIndex:function($ele){
                var me = this;
                return $ele.parents('div[data-index]').data('index');
            },
            sort_TaskList:function(){
                var me = this;
                var arr = []
                for(var i = 0;i<me.task_list.length;i++){
                    if(me.task_list[i]&&me.task_list[i].checked){
                        arr.push(me.task_list[i])
                        delete me.task_list[i];
                    }
                }
                $.merge(me.task_list,arr);
                me.update_store()
            },
            updata_TaskList:function(index,data){
                var me =this;
                $.extend(me.task_list[index],data);
                me.update_store();
            },
            update_store:function(){
                var me = this;
                store.set('task_list',me.task_list);
            },
            refresh_list:function(){
                var me = this;
                me.sort_TaskList();
                var listHtml ="";
                me.task_list = store.get('task_list')||[];
                for(var i = 0;i<me.task_list.length;i++){
                    if(me.task_list[i]){
                        listHtml+=me.conListDom(i);
                    }
                }
                me.$list.empty().append(listHtml);

            },
            fixedDate:function(str){
                var value=str.substr(str.length-2)
                if(value<10){
                    str = str.substring(0,str.length-1) + "0" + str.substr(str.length-1)
                }
                return str;
            },




            //渲染list  DOM结构
            conListDom:function(index){
                var me = this;
                var data = me.task_list[index];
                var check = data.checked?"checked":"";
                var itemClass = data.checked?"task-item completed":"task-item";
                var listDom =
                '<div class="'+itemClass+'" data-index='+index+'>'+
                    '<span><input type="checkbox" '+check+'></span>'+
                    '<span class="task-content">' + data.content + '</span>'+
                    '<span>——'+data.date+'</span>'+
                    '<span class="right">'+
                    '<span class="active delete">删除</span>'+
                    '<span class="active detail">    详细</span>'+
                    '</span>'+
                '</div>'
                ;
                return listDom;
            },
            //
            renderDetail:function(index){
                var me = this;
                var item = me.task_list[index];
                var detailDom =
                    '<form>' +
                        '<div class="content">' +
                            item.content +
                        '</div>' +
                        '<div>' +
                            '<input style="display:none" type="text" name="content" autofocus autocomplete="off" value="'+item.content+'">' +
                        '</div>' +
                        '<div>' +
                            '<div class="desc">' +
                                '<textarea name="desc" placeholder="'+item.areaHolder+'">' +item.desc+ '</textarea>' +
                            '</div>' +
                        '</div>' +
                        '<div class="remind">' +
                            '<input type="date" name="remind_date" value=' + item.date + '>' +
                            '<button type="submit">submit</button>' +
                        '</div>' +
                    '</form>'
                    ;
                me.$detail.empty().append(detailDom);

                //绑定双击更改事件
                me.$detail.on({
                    click:function(){
                        var $this = $(this);
                        $this.css('display','none');
                        me.$detail.find('input[name=content]').css('display','block');
                    }
                },'.content');

                me.$detail.on('submit',function(e){
                    e.preventDefault();
                    var data={};
                    data.content = me.$detail.find('[name=content]').val();
                    data.desc = me.$detail.find('[name=desc]').val();
                    data.date = me.$detail.find('[name=remind_date]').val();
                    me.updata_TaskList(index,data);
                    me.$detail.hide();
                    me.$detail_mask.hide();
                    me.refresh_list();
                })

            }

        }
        return myTodo;
    })()

    $.fn.myTodo = function(options){
        return this.each(function(){
            var self = $(this),
                instance = self.data('myTodo');
            if(!instance){
                var instance = new myTodo(self,options);
                self.data('myTodo',instance)
            }
        })
    }
    $.fn.myTodo.default = {
        h1:'我的todo',
        placeholder:'添加一些信息'
    }

})(jQuery)
