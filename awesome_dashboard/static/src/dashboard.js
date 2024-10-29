/** @odoo-module **/
import { Component , useState } from "@odoo/owl";
import { Layout } from "@web/search/layout";  
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import {DashboardItem} from "./component"
class AwesomeDashboard extends Component {
    setup() {
        this.action = useService("action");
        this.orm = useService("orm");
        this.newresult=useState([])
        this.formData = useState({ name: '', email: '' });
        this.updatedData = useState({ name: '', email: '' });
        this.state=useState({edit:false});
        this.new_state=useState({new_edit:false});
        this.text=useState({new_text:"New Record"});
        this.search_data=useState({search_text:""});
        // this.fetchPartners();
    }
    async search_form(){
        const new_partners = await this.orm.call('res.partner', 'search_read', [ [['name', 'ilike', this.search_data.search_text]],   ['name', 'email']  ] );
        this.newresult.splice(0, this.newresult.length, ...new_partners);
        this.search_data.search_text=""
        
    }
    async toggleedit(ev) {
        this.state.edit = !this.state.edit;
        const partnerId = parseInt(ev.target.getAttribute('data-partner-id'));  
        this.editingPartnerId = partnerId; 
    }
    new_record()
    {
        if (this.new_state.new_edit === true){
            this.new_state.new_edit = false
            this.text.new_text="New Record ";
        }
        else{
            this.new_state.new_edit = true
            this.text.new_text="Close Form";
        }

    }
    async openLeads() {
        this.action.doAction("awesome_dashboard.action_partner_form");
    }
    async fetchPartners() {

        try {
            const partners = await this.orm.call('res.partner', 'search_read', [[], ['name', 'email']]);
            const abcd = await this.orm.call('res.users', 'search_read', [[], ['name', 'email','login','password','active','lang','signature']]);
            const result=JSON.stringify(partners)
            const new_abcd=JSON.stringify(abcd)
            console.log("##################################",new_abcd)
            this.newresult.splice(0, this.newresult.length, ...partners); 
        } catch (error) {
            alert("Error fetching partners: " + error.message);
        }
    }
    async createPartner() {
        try {
            if(this.formData.name==="" || this.formData.email==="") {
                alert("Enter The Required Details")
            }
            else{
            const newPartnerId = await this.orm.call('res.partner', 'create', [this.formData]); 
            console.log("New partner created with ID:", newPartnerId);
            await this.fetchPartners(); 
            this.formData=[{ name: '', email: '' }]
            this.new_state.new_edit=!this.new_state.new_edit

            }
        } catch (error) {
            console.error("Error creating partner:", error);
        }
    }
    async updatePartner(ev) {
        const partnerId = parseInt(ev.target.getAttribute('data-partner-id')); 
        if(this.updatedData.name==="" || this.updatedData.email==="") {
            alert("Enter The Required Details")
        }
        else{
        try {
            console.log("Updating partner with ID:", partnerId, "with data:", this.updatedData);
            const result = await this.orm.call('res.partner', 'write', [[partnerId], this.updatedData]);
            console.log("Update result:", result);
            if (result) {
                console.log("Partner updated:", partnerId);
                await this.fetchPartners(); 
            } else {
                console.error("Failed to update partner:", partnerId);
            }
        } catch (error) {
            console.log("Error updating partner:", error);
        }
        this.state.edit = !this.state.edit;
        this.editingPartnerId=null;

    }
    }
    async cancelEdit(ev) {
        console.log("Cancelling edit");
        this.editingPartnerId = null;
        await this.fetchPartners(); 
    }
    
    async deletePartner(ev) {
        const result_delete = confirm("Are you sure?");
        if(result_delete){
        const partnerId = parseInt(ev.target.getAttribute('data-partner-id'));  
        try {
            const result = await this.orm.call('res.partner', 'unlink', [[partnerId]]); 
            if (result) {
                await this.fetchPartners();  
            } else {
                console.error("Failed to delete partner:", partnerId);
            }
        } catch (error) {
            console.error("Error deleting partner:", error);
        }
    }
    else{
        alert("Record Not Deleted")
    }
    }
    
    
    
    
    

}

registry.category("actions").add("awesome_dashboard.dashboard", AwesomeDashboard);

AwesomeDashboard.components = { Layout , DashboardItem};
AwesomeDashboard.template = "awesome_dashboard.AwesomeDashboard";

