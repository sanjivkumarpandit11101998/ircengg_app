import frappe

def leave_allocation(self, on_update):
    doc=self
    if(doc.is_new()==False):
        if doc.leave_policy_assignment:
            if doc.leave_type == 'Earned Leave for more than of 3 Yrs Experienced':
                doc.new_leaves_allocated=10
            elif doc.leave_type == 'Earned Leave':
                doc.new_leaves_allocated=doc.new_leaves_allocated+1.75