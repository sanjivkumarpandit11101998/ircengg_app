// Copyright (c) 2023, IRC Engg and contributors
// For license information, please see license.txt

var assets;
var consumable_items;
var prev_challan_no;
var asst_accss;
var consm_accss;
frappe.ui.form.on('Items Asset Movement', {
	refresh(frm) {
	   // frm.set_query('item','consumable_items',()=>{
	   //     return {
	   //         filters:{
	   //             is_stock_item:1
	   //         }
	   //     };
	   // });
	    frm.set_query("challan_no", function() {
            return {
                "filters": [
                    ["Items Asset Movement", "transfer_type", "!=", "Site To Store"],
                    ["Items Asset Movement", "docstatus", "=", 1]
                ]
            };
        });
        // if(frm.doc.transfer_type=='Store To Site')
        // {
        //     frm.set_query('asset','asset_items',()=>{
	       //     return {
	       //         filters:{
	       //             location:'STORE'
	       //         }
	       //     };
	       // });
        // }
	},
	setup(frm){
	    frm.set_query('asset','asset_items',()=>{
	            if(frm.doc.transfer_type=="Store To Site")
	            {
	                return {
	                    filters:[
	                       // ['location','=','Noida'],
	                        ['status','not in',['In Maintenance','Out of Orders']],
	                        ['location','=','Store'],
	                        ['docstatus','=',1],
	                        ['asset_category','=',cur_frm.doc.asset_category]
	                    ]
	                };
	            }
	            else
	                return {};
	        });
	    frm.set_query('item','consumable_items',()=>{
	        return {
	            filters:{
	                is_stock_item:1,
	                asset_category:cur_frm.doc.item_category
	            }
	        };
	    });
	},
	validate(frm)
	{
	    if(frm.doc.transfer_type=='Site To Store')
	    {
	        frm.doc.site_name!='Store'||frm.doc.site_incharge!='HR-EMP-00065'?frappe.throw("Site Incharge must be HR-EMP-00065 and Site Name must be Store"):'';
	    }
	},
	onload(frm){
	    cur_frm.doc.transaction_date=moment().format('YYYY-MM-DD hh:mm:ss');
	},
// 	transfer_type(frm){
// 	       // frm.doc.transaction_date=new Date();
// 	       // cur_frm.refresh();
// 	},
// 	item_category(frm){
// 	    frm.trigger('asset_filter')
// 	},
	"site_incharge":(frm) =>{
	    if(cur_frm.doc.asset_items)
	    {
	        for (var i =0; i < cur_frm.doc.asset_items.length; i++)
            { 
                cur_frm.doc.asset_items[i].to_employee = cur_frm.doc.site_incharge ;
            }
	    }
        if(cur_frm.doc.consumable_items)
        {
            for (var j =0; j < cur_frm.doc.consumable_items.length; j++)
            { 
                cur_frm.doc.consumable_items[j].to_employee = cur_frm.doc.site_incharge;
            }
        }
        frm.refresh_field('asset_items');
        frm.refresh_field('consumable_items');
	},
	before_save(frm){
	    if(cur_frm.doc.site_incharge&&cur_frm.doc.site_name)
	    {
	        if(cur_frm.doc.asset_items)
	        {
	            for (var i =0; i < cur_frm.doc.asset_items.length; i++)
                {
                    cur_frm.doc.asset_items[i].to_employee = cur_frm.doc.site_incharge;
                    cur_frm.doc.asset_items[i].to_location = cur_frm.doc.site_name;
                }
	        }
            if(cur_frm.doc.consumable_items)
            {
                for (var j =0; j < cur_frm.doc.consumable_items.length; j++)
                {
                    cur_frm.doc.consumable_items[j].to_employee = cur_frm.doc.site_incharge;
                    cur_frm.doc.consumable_items[j].to_location = cur_frm.doc.site_name;
                }
            }
	    }
	},
	"site_name":(frm) =>{
	    if(cur_frm.doc.asset_items)
	    {
	        for (var i =0; i < cur_frm.doc.asset_items.length; i++)
            { 
                cur_frm.doc.asset_items[i].to_location = cur_frm.doc.site_name;
            }
	    }
	    if(cur_frm.doc.consumable_items)
	    {
            for (var j =0; j < cur_frm.doc.consumable_items.length; j++)
            { 
                cur_frm.doc.consumable_items[j].to_location = cur_frm.doc.site_name;
            }
	    }
        cur_frm.refresh_field('consumable_items');
        cur_frm.refresh_field('asset_items');
	},
	challan_no(frm){
	    frm.trigger('get_assets').then(()=>{
	        if(!prev_challan_no||prev_challan_no!==cur_frm.doc.challan_no)
	        {
	            if(frm.doc.transfer_type=="Site To Site"||frm.doc.transfer_type=="Site To Store")
	            {
	                frappe.db.get_value('Items Asset Movement',cur_frm.doc.challan_no,['transfer_type','store_challan_no']).then((v)=>{
	                    v.message.transfer_type=="Store To Site"?frm.set_value("store_challan_no", frm.doc.challan_no):frm.set_value("store_challan_no", v.message.store_challan_no);
	                    frm.refresh();
	                });
	            }
	            frm.trigger('add_data_to_child');
	            prev_challan_no=cur_frm.doc.challan_no;
	        }
	    });
	},
	'add_data_to_child':(frm)=>{	    
	    frappe.call({
            method: "ircengg_app.ircengg_app.doctype.items_asset_movement.items_asset_movement.get_non_return_asset",
            args: {
                val_data:{
                    'challan_no':cur_frm.doc.challan_no
                }
            },
		       	freeze: true,
		       	freeze_message: __('Validating Challan Items')
        }).then((value)=>{
            // frm.trigger('clear_items').then(()=>{
                cur_frm.clear_table("asset_items");
                cur_frm.clear_table("consumable_items");
				console.log(value)
                if(frm.doc.transfer_type=="Site To Store")
                {
                    cur_frm.doc.site_incharge='HR-EMP-00065';
                    cur_frm.doc.site_name='Store';
                    cur_frm.doc.destination='Noida';
                    cur_frm.doc.responsiblity='HR-EMP-00065';
                    cur_frm.refresh();
                }
                value.message[0].forEach((r)=>{
	                frm.add_child('asset_items', {
                        asset: r.asset,
                        transfer_quantity: r.transfer_quantity
                    });
                });
                value.message[1].forEach((r)=>{
	                   frm.add_child('consumable_items', {
                        item: r.item,
                        quantity: r.quantity,
                        from_location: r.to_location,
                        from_employee: r.to_employee,
                        item_description: r.item_description
                    });
	               });
//	               console.log(value);
                    cur_frm.refresh_field('consumable_items');
                    cur_frm.refresh_field('asset_items');
            // });
        });
	    frm.refresh();
	},
// 	'clear_items':(frm)=>{
// 	    try{
//             cur_frm.doc.asset_items.forEach((itms,i)=>{
//                 cur_frm.get_field('asset_items').grid.grid_rows[i].remove();
//             });
//             cur_frm.doc.consumable_items.forEach((itms,i)=>{
//                 cur_frm.get_field('consumable_items').grid.grid_rows[i].remove();
//             });
//         }
//       catch(err){}
// 	},
	'get_assets':(frm)=>{
	    frappe.db.get_list('Asset Items',{filters: {'parent':cur_frm.doc.challan_no},fields:['asset','transfer_quantity']}).then((asset_data)=>{
	        assets=asset_data;
	    });
	    frappe.db.get_list('Consumable Items',{filters: {'parent':cur_frm.doc.challan_no},fields:['item','quantity','to_location','to_employee','item_description']}).then((consumable_data)=>{
	        consumable_items=consumable_data;
	    });
	},
	get_all_items(frm){
	    if(frm.doc.get_all_items && frm.doc.item_category)
	    {
	        cur_frm.clear_table("consumable_items");
	        frappe.db.get_list('Item',{filters:{'asset_category':frm.doc.item_category,'is_stock_item':1},fields:['name','item_name','description'],limit:500}).then((c_items)=>{
	            console.log(c_items)
	            c_items.forEach((val)=>{
	                frm.add_child('consumable_items', {
                        item: val.name,
                        item_name: val.item_name,
                        item_description:val.description,
                        to_location:frm.doc.site_name,
                        to_employee:frm.doc.site_incharge
	                });
	            });
	            frm.get_field('consumable_items').grid.grid_pagination.page_length = 200;
	            cur_frm.refresh_field('consumable_items');
	        });
	    }
	    else if(frm.doc.item_category)
	    {
	        cur_frm.clear_table("consumable_items");
	        cur_frm.refresh_field('consumable_items');
	    }
	},
	add_asset_accessories(frm){
	   // frappe.db.get_list('Asset Accessories',{filters:{'parent':cur_frm.doc.asset_items[cur_frm.doc.asset_items.length-1].asset},fields:['asset_accessories']}).then((asset)=>{
	   //     asset.forEach((asst)=>{
	   //         frm.add_child('asset_items', {
    //                 asset: asst.asset_accessories
    //             });
    //             frm.refresh_fields('asset_items');
	   //     });
	   // });
	   // frappe.db.get_list('Item Accessories',{filters:{'parent':cur_frm.doc.asset_items[cur_frm.doc.asset_items.length-1].asset},fields:['item_accessories']}).then((asset)=>{
	   //     asset.forEach((asst)=>{
	   //         frm.add_child('consumable_items', {
    //                 item: asst.item_accessories
    //             });
    //             frm.refresh_fields('consumable_items');
	   //     });
	   // });
	    frappe.db.get_value('Asset',{'parent_items':cur_frm.doc.asset_items[cur_frm.doc.asset_items.length-1].asset},['name','asset_name']).then((asset_value)=>{
	        if(asset_value.message.name)
	        {
	            console.log(asset_value)
	            frm.add_child('asset_items', {
                    asset: asset_value.message.name,
                    asset_name: asset_value.message.asset_name
	            });
                frm.refresh_fields('asset_items');
	        }
	    });
	   // frm.add_child('asset_items', {,
    //         asset: r.asset,
    //         transfer_quantity: r.transfer_quantity
    //     });
    //     frm.add_child('consumable_items', {
    //         a: r.asset,
    //     });
	    //frappe.msgprint('trial');
	}
});
frappe.ui.form.on('Asset Items', {
	asset_items_add(frm, cdt, cdn) {
	    cur_frm.doc.asset_items[cur_frm.doc.asset_items.length-1].to_location=cur_frm.doc.site_name;
	    cur_frm.doc.asset_items[cur_frm.doc.asset_items.length-1].to_employee = cur_frm.doc.site_incharge ;
	    cur_frm.refresh_field('asset_items');
	},
	asset(frm){
	   // frappe.msgprint('done');
	    frm.trigger('add_asset_accessories');
	}
});
frappe.ui.form.on('Consumable Items', {
	consumable_items_add(frm, cdt, cdn) {
	    cur_frm.doc.consumable_items[cur_frm.doc.consumable_items.length-1].to_location=cur_frm.doc.site_name;
	    cur_frm.doc.consumable_items[cur_frm.doc.consumable_items.length-1].to_employee = cur_frm.doc.site_incharge;
	    cur_frm.refresh_field('consumable_items');
	}
});