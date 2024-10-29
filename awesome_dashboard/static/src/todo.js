/** @odoo-module **/
import { registry } from '@web/core/registry';
const { Component, mount, xml, useState, useRef, onMounted } = owl;
import { useService } from '@web/core/utils/hooks';

export class OwlTodoList extends Component {
    static template = xml`
    <div class="task container mt-4 p-4" style="background-color:#ced4de; border-radius:30px;" >
        <h1 class="display-6" t-att-class="props.task.mark ? 'done text-muted' : ''">
        <t t-if="!state.edit">
        <h2 style="color:#0056b3" >
        <t t-out="props.task.text" />
        </h2>
        <input type="checkbox" t-att-checked="props.task.mark" t-on-click="toggle_task" /><span> <b> Mark as done </b> </span>
                <br/><br/>
                <button class=" awesome_dashboard_btn btn awesome_dashboard_btn_primary btn-primary btn-sm" t-on-click="edit_task">Edit</button>
            </t>
            <t t-else="state.edit">
                <input type="text" class="form-control" t-model="props.task.text"  style="width: 100%; padding: 4px; border: 2px solid #007bff; border-radius: 25px; transition: border-color 0.3s, box-shadow 0.3s;" />
                <br/><br/>
                <button class="awesome_dashboard_btn btn btn-success btn-sm" t-on-click="save_task">Save</button>
            </t>
            <button class="awesome_dashboard_btn btn awesome_dashbboard_btn_danger btn-danger btn-sm del_btn" t-on-click="delete_task">Delete</button>
        </h1>
    </div>
    `;
    delete_task() {
        this.props.ondelete(this.props.task.id);
    }

    toggle_task() {
        this.props.task.mark = !this.props.task.mark;
    }

    edit_task() {
        this.state.edit = !this.state.edit;
    }

    save_task() {
        console.log(this.props.task.text)
        this.state.edit = !this.state.edit;
        this.props.onedit(this.props.task.id);
    }

    setup() {
        this.state = useState({
            edit: false,
        });
    }

    static props = ['task', 'ondelete', 'onedit'];
}

class Root extends Component {
    static template = xml`
        <div class="task-list">
        <div style="display:flex" >
            <button type="button" class="btn awesome_dashboard_btn_primary btn-primary awesome_dashboard_btn" t-on-click="new_task"> Add Task</button>
            <input type="search" t-model="search_task.search_text" placeholder="Search here..." style="width: calc(30% - 24px); padding: 4px; border: 2px solid #007bff; border-radius: 25px; transition: border-color 0.3s, box-shadow 0.3s;" />
            <button type="button" t-on-click="search_task_form" class="btn awesome_dashboard_btn_primary btn-primary awesome_dashboard_btn">Search</button>
            </div>
            <t t-if="state.task" >
            <h1 class="h1" >Add items </h1>
            <input type="text" class="form_text" placeholder="Enter item" t-on-keyup="additem" t-ref="add-input" style="width: calc(30% - 24px); padding: 4px; border: 2px solid #007bff; border-radius: 25px; transition: border-color 0.3s, box-shadow 0.3s;" />
            </t>
            <br/>
            <br/>
            <div class="scrollable-tasks">
                <t t-foreach="tasks" t-as="task" t-key="task.id">
                    <Task task="task" ondelete.bind="deletetask" onedit.bind="save_to_memory" />
                </t>
            </div>
        </div> 
        `;
    
    static components = { Task: OwlTodoList };

    setup() {
        this.tasks = useState([]);
        const inputref = useRef('add-input');
        this.orm = useService('orm');
        this.state=useState({task:false});
        
        this.search_task=useState({search_text:""});
        
        onMounted(() => {
            // inputref.el.focus();
            this.loadTasks();
        });
    }
    async search_task_form(){
        console.log("hi")
        const new_partners_task = await this.orm.call('project.task', 'search_read', [ [['name', 'ilike', this.search_task.search_text]],   ['name', 'stage_id']  ] );
        console.log(new_partners_task)
        this.tasks.splice(0, this.tasks.length, ...new_partners_task.map(task => ({
            id: task.id,
            text: task.name,
            mark: task.stage_id[2] ? true : false  
        })));
        console.log(this.tasks)
        
    }
    new_task(){
        this.state.task=!this.state.task
    }
    async loadTasks() {
        const tasks = await this.orm.call('project.task', 'search_read', [[['id', '!=', false]], ['name', 'stage_id']]);
        this.tasks.splice(0, this.tasks.length, ...tasks.map(task => ({
            id: task.id,
            text: task.name,
            mark: task.stage_id[2] ? true : false  
        })));
    }

    async additem(e) {
        if (e.keyCode === 13) {
            const text = e.target.value.trim();
            e.target.value = "";
            if (text) {
                const isDuplicate = this.tasks.some(task => task.text === text);
                if (!isDuplicate) {
                    const result = await this.orm.call('project.task', 'create', [{ name: text }]);
                    const newtask = {
                        text: text,
                        id: result,
                        mark: false
                    };
                    this.tasks.push(newtask);
                } else {
                    alert("This task already exists.");
                }
            }
        }
    }

    async deletetask(task_id) {
        await this.orm.call('project.task', 'unlink', [[task_id]]);
        const del_task = this.tasks.findIndex(task => task.id === task_id);
        if (del_task !== -1) {
            this.tasks.splice(del_task, 1);
        }
    }
    
    async save_to_memory(task_id) {
            const dummy_text=this.tasks.find(task => task.id === task_id).text;
            try{
            const edit_result = await this.orm.call('project.task', 'write', [[task_id], dummy_text]);
            }
            catch(err){
                console.error("this error " , err)
            }
    }

    nextid = 1;
}

registry.category('actions').add('owl.action_todo_list_js_new', Root);
