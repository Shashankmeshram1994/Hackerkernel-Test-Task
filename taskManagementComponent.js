import { LightningElement,wire , track} from 'lwc';
import getTasks from '@salesforce/apex/TaskController.getTasks';
import createNewTask from '@salesforce/apex/TaskController.createNewTask';
import { refreshApex } from '@salesforce/apex';


const columns = [
        { label: 'Task Name', fieldName: 'taskLink', type: 'url', 
            typeAttributes: { label: { fieldName: 'Name' }, target: '_blank' } },
        { label: 'Priority', fieldName: 'Priority__c' },
        { label: 'Due Date', fieldName: 'Due_Date__c', type: 'date' },
        { label: 'Status', fieldName: 'Status__c' },
        { label: 'Priority', fieldName: 'Priority__c' },
        { label: 'Assigned To', fieldName: 'Assigned_To__c' },
        { label: 'Description', fieldName: 'Description__c' },
    ];


export default class TaskManagementComponent extends LightningElement {

    columns = columns;
    @track taskList = [];
    @track  taskObject = {'sObjectType' : 'Task__c'};

    @wire(getTasks)
    wiredTasks(result) {
        this.wiredTasksResult = result;  
        if (result.data) {
            this.taskList = result.data.map(task => ({
                ...task,
                taskLink: `/lightning/r/Task/${task.Id}/view`,
                Assigned_To__c: task.Assigned_To__r ? task.Assigned_To__r.Name : '' 
            }));
        } else if (result.error) {
            console.log('Error ', result.error);
        }
    }

     handleRowAction(event) {
        const taskId = event.detail.row.Id;
        this.navigateToTaskDetail(taskId);
    }

    // Navigation to the task detail page
    navigateToTaskDetail(taskId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: taskId,
                objectApiName: 'Task',
                actionName: 'view',
            },
        });
    }

    get priorityOptions(){
        return [
            {label:'New',value:'New'},
            {label:'Medium',value:'Medium'},
            {label:'High',value:'High'}
        ]
    }
    handlePriorityChange(event){
        this.taskObject.Priority__c = event.detail.value;
    }

    get statusOptions(){
        return [
            {label:'New',value:'New'},
            {label:'In Progress',value:'In Progress'},
            {label:'Complete',value:'Complete'}
        ]
    }
    handleStatusChange(event){
        this.taskObject.Status__c = event.detail.value;
    }

    isModalOpen = false;

    handleNewTaskClick(){
        this.isModalOpen = true;
    }

      handleCloseModal() {
        this.isModalOpen = false;
    }

     handleCreateTask(event) {
       this.taskObject.Name = this.template.querySelector('lightning-input[data-formfield="taskname"]').value;
       this.taskObject.Description__c = this.template.querySelector('lightning-input[data-formfield="taskdes"]').value;
       this.taskObject.Due_Date__c = this.template.querySelector('lightning-input[data-formfield="duedate"]').value;
       console.log('Object',JSON.stringify(this.taskObject));

       createNewTask({objTask : this.taskObject})
       .then(result=>{
            if(result === true){
                refreshApex(this.wiredTasksResult);
                this.isModalOpen = false;
            }
       })
       .catch(error=>{
            console.log(error);
            this.isModalOpen = false;
       })
    }
}