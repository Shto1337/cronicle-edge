// Cronicle Admin Page -- Config Keys

Class.add( Page.Admin, {
	
	gosub_conf_keys: function(args) {
		// show Config Key list
		app.setWindowTitle( "Config Keys" );
		this.div.addClass('loading');
		app.api.post( 'app/get_conf_keys', copy_object(args), this.receive_confkeys.bind(this) );
	},
	
	receive_confkeys: function(resp) {
		// receive all Config Keys from server, render them sorted
		this.lastConfigKeysResp = resp;
		
		var html = '';
		this.div.removeClass('loading');
		
		var size = get_inner_window_size();
		var col_width = Math.floor( ((size.width * 0.9) + 200) / 7 );
		
		if (!resp.rows) resp.rows = [];
		
		// sort by title ascending
		this.conf_keys = resp.rows.sort( function(a, b) {
			return a.title.toLowerCase().localeCompare( b.title.toLowerCase() );
		} );
		
		html += this.getSidebarTabs( 'conf_keys',
			[
				['activity', "Activity Log"],
				['conf_keys', "Config Keys"],
				['api_keys', "API Keys"],
				['categories', "Categories"],
				['plugins', "Plugins"],
				['servers', "Servers"],
				['users', "Users"]
			]
		);
		
		var cols = ['Config Key', 'Value', 'Action'];
		
		html += '<div style="padding:20px 20px 30px 20px">';
		
		html += '<div class="subtitle">';
		html += 'Config Keys';
		html += `<div class="subtitle_widget"><a href="/conf" ><b>Config Viewer</b></a></div>`
		html += '<div class="clear"></div>';
		html += '</div>';
		
		var self = this;
		html += this.getBasicTable( this.conf_keys, cols, 'key', function(item, idx) {
			var actions = [
				'<span class="link" onMouseUp="$P().edit_conf_key('+idx+')"><b>Edit</b></span>',
				'<span class="link" onMouseUp="$P().delete_conf_key('+idx+')"><b>Delete</b></span>'
			];

			return [
				`<div style="white-space:nowrap;" title="${item.description}" ><i class="fa fa-wrench">&nbsp;&nbsp;</i><b>${item.title}<b></div>`
				, `<div class="activity_desc">${item.key}</div>`
				, '<div style="white-space:nowrap;">' + actions.join(' | ') + '</div>'
			];
		} );
		
		html += '<div style="height:30px;"></div>';
		html += '<center><table><tr>';
			html += '<td><div class="button" style="width:130px;" onMouseUp="$P().edit_conf_key(-1)"><i class="fa fa-plus-circle">&nbsp;&nbsp;</i>Add Config Key...</div></td>';
			html += '<td width="40">&nbsp;</td>';
			html += '<td><div class="button" style="width:130px;" onMouseUp="$P().do_reload_conf_key()"><i class="fa fa-refresh">&nbsp;&nbsp;</i>Reload</div></td>';
		html += '</tr></table></center>';
		
		html += '</div>'; // padding
		html += '</div>'; // sidebar tabs
		
		this.div.html( html );
	},
	
	edit_conf_key: function(idx) {
		// jump to edit sub
		if (idx > -1) Nav.go( '#Admin?sub=edit_conf_key&id=' + this.conf_keys[idx].id );
		else Nav.go( '#Admin?sub=new_conf_key' );
	},
	
	delete_conf_key: function(idx) {
		// delete key from search results
		this.conf_key = this.conf_keys[idx];
		this.show_delete_conf_key_dialog();
	},
	
	gosub_new_conf_key: function(args) {
		// create new Config Key
		var html = '';
		app.setWindowTitle( "New Config Key" );
		this.div.removeClass('loading');
		
		html += this.getSidebarTabs( 'new_conf_key',
			[
				['activity', "Activity Log"],
				['conf_keys', "Config Keys"],
				['new_conf_key', "New Config Key"],
				['api_keys', "API Keys"],
				['categories', "Categories"],
				['plugins', "Plugins"],
				['servers', "Servers"],
				['users', "Users"]
			]
		);
		
		html += '<div style="padding:20px;"><div class="subtitle">New Config Key</div></div>';
		
		html += '<div style="padding:0px 20px 50px 20px">';
		html += '<center><table style="margin:0;">';
		
		this.conf_key = { key: 'true' };
		
		html += this.get_conf_key_edit_html();
		
		// buttons at bottom
		html += '<tr><td colspan="2" align="center">';
			html += '<div style="height:30px;"></div>';
			
			html += '<table><tr>';
				html += '<td><div class="button" style="width:120px; font-weight:normal;" onMouseUp="$P().cancel_conf_key_edit()">Cancel</div></td>';
				html += '<td width="50">&nbsp;</td>';
				
				html += '<td><div class="button" style="width:120px;" onMouseUp="$P().do_new_conf_key()"><i class="fa fa-plus-circle">&nbsp;&nbsp;</i>Create Key</div></td>';
			html += '</tr></table>';
			
		html += '</td></tr>';
		
		html += '</table></center>';
		html += '</div>'; // table wrapper div
		
		html += '</div>'; // sidebar tabs
		
		this.div.html( html );
		
		setTimeout( function() {
			$('#fe_ck_title').focus();
		}, 1 );
	},
	
	cancel_conf_key_edit: function() {
		// cancel editing Config Key and return to list
		Nav.go( 'Admin?sub=conf_keys' );
	},
	
	do_new_conf_key: function(force) {
		// create new Config Key
		app.clearError();
		var conf_key = this.get_conf_key_form_json();
		if (!conf_key) return; // error
		
		if (!conf_key.title.length) {
			return app.badField('#fe_ck_title', "Please enter Config Name");
		}
		
		this.conf_key = conf_key;
		
		app.showProgress( 1.0, "Creating Config Key..." );
		app.api.post( 'app/create_conf_key', conf_key, this.new_conf_key_finish.bind(this) );
	},
	
	new_conf_key_finish: function(resp) {
		// new Config Key created successfully
		app.hideProgress();
		
		Nav.go('Admin?sub=edit_conf_key&id=' + resp.id);
		
		setTimeout( function() {
			app.showMessage('success', "The new Config Key was created successfully.");
		}, 150 );
	},
	
	gosub_edit_conf_key: function(args) {
		// edit Config Key subpage
		this.div.addClass('loading');
		app.api.post( 'app/get_conf_key', { id: args.id }, this.receive_confkey.bind(this) );
	},
	
	receive_confkey: function(resp) {
		// edit existing Config Key
		var html = '';
		this.conf_key = resp.conf_key;
		
		app.setWindowTitle( "Editing Config Key \"" + (this.conf_key.title) + "\"" );
		this.div.removeClass('loading');
		
		html += this.getSidebarTabs( 'edit_conf_key',
			[
				['activity', "Activity Log"],
				['conf_keys', "Config Keys"],
				['edit_conf_key', "Edit Config Key"],
				['api_keys', "API Keys"],
				['categories', "Categories"],
				['plugins', "Plugins"],
				['servers', "Servers"],
				['users', "Users"]
			]
		);
		
		html += '<div style="padding:20px;"><div class="subtitle">Editing Config Key &ldquo;' + (this.conf_key.title) + '&rdquo;</div></div>';
		
		html += '<div style="padding:0px 20px 50px 20px">';
		html += '<center>';
		html += '<table style="margin:0;">';
		
		html += this.get_conf_key_edit_html();
		
		html += '<tr><td colspan="2" align="center">';
			html += '<div style="height:30px;"></div>';
			
			html += '<table><tr>';
				html += '<td><div class="button" style="width:120px; font-weight:normal;" onMouseUp="$P().cancel_conf_key_edit()">Cancel</div></td>';
				html += '<td width="40">&nbsp;</td>';
				html += '<td><div class="button" style="width:120px; font-weight:normal;" onMouseUp="$P().show_delete_conf_key_dialog()">Delete Key...</div></td>';
				html += '<td width="40">&nbsp;</td>';
				html += '<td><div class="button" style="width:120px;" onMouseUp="$P().do_save_conf_key()"><i class="fa fa-floppy-o">&nbsp;&nbsp;</i>Save Changes</div></td>';
				html += '<td width="40">&nbsp;</td>';
				html +=  '<td><div class="button" style="width:120px;" onMouseUp="$P().edit_conf_key(-1)"><i class="fa fa-plus-circle">&nbsp;&nbsp;</i> New </div></td>';
			html += '</tr></table>';
			
		html += '</td></tr>';
		
		html += '</table>';
		html += '</center>';
		html += '</div>'; // table wrapper div
		
		html += '</div>'; // sidebar tabs
		
		this.div.html( html );
	},
	
	do_save_conf_key: function() {
		// save changes to Config Key
		app.clearError();
		var conf_key = this.get_conf_key_form_json();
		if (!conf_key) return; // error
		
		this.conf_key = conf_key;
		
		app.showProgress( 1.0, "Saving Config Key..." );
		app.api.post( 'app/update_conf_key', conf_key, this.save_conf_key_finish.bind(this) );
	},
	
	save_conf_key_finish: function(resp, tx) {
		// new Config Key saved successfully
		app.hideProgress();
		app.showMessage('success', "The Config Key was saved successfully.");
		window.scrollTo( 0, 0 );
	},

	do_reload_conf_key: function(args) {
		// save changes to Config Key
		app.clearError();
		app.showProgress( 1.0, "Reloading Config Key..." );
		app.api.post( 'app/reload_conf_key', args, this.reload_conf_key_finish.bind(this) );
	},
	
	reload_conf_key_finish: function(resp, tx) {
		// new Config Key saved successfully
		app.hideProgress();
		app.showMessage('success', "Config Keys were reloaded successfully.");
		window.scrollTo( 0, 0 );
	},

	
	show_delete_conf_key_dialog: function() {
		// show dialog confirming Config Key delete action
		var self = this;
		app.confirm( '<span style="color:red">Delete Config Key</span>', "Are you sure you want to <b>permanently delete</b> the Config Key \""+this.conf_key.title+"\"?  There is no way to undo this action.", 'Delete', function(result) {
			if (result) {
				app.showProgress( 1.0, "Deleting Config Key..." );
				app.api.post( 'app/delete_conf_key', self.conf_key, self.delete_conf_key_finish.bind(self) );
			}
		} );
	},
	
	delete_conf_key_finish: function(resp, tx) {
		// finished deleting Config Key
		var self = this;
		app.hideProgress();
		
		Nav.go('Admin?sub=conf_keys', 'force');
		
		setTimeout( function() {
			app.showMessage('success', "The Config Key '"+self.conf_key.title+"' was deleted successfully.");
		}, 150 );
	},
	
	get_conf_key_edit_html: function() {
		// get html for editing an Config Key (or creating a new one)
		var html = '';
		var conf_key = this.conf_key;

				
		// title
		var disableConfTitle = ''
		if(conf_key.title) disableConfTitle = 'disabled' // let edit only if new
		html += get_form_table_row( 'Config Title', `<input type="text" id="fe_ck_title" size="73" value="${escape_text_field_value(conf_key.title)}" spellcheck="false" ${disableConfTitle}/>` );
		html += get_form_table_caption( "For nested properties use . (e.g. servers.worker1)");
		html += get_form_table_spacer();
		
		// Config Key
		html += get_form_table_row( 'Value', '<input type="text" id="fe_ck_key" size="73" value="'+escape_text_field_value(conf_key.key)+'" spellcheck="false"/>' );
		html += get_form_table_caption( "For boolean use 0/1 or true/false" );
		html += get_form_table_spacer();


		// description
		html += get_form_table_row('Description', '<textarea id="fe_ck_desc" style="width:550px; height:100px; resize:vertical;">'+escape_text_field_value(conf_key.description)+'</textarea>');
		html += get_form_table_caption( "Config purpose (optional)" );
		html += get_form_table_spacer();
		
		return html;
	},
	
	get_conf_key_form_json: function() {
		// get Config Key elements from form, used for new or edit
		var conf_key = this.conf_key;
		
		conf_key.key = $('#fe_ck_key').val();
		conf_key.active = $('#fe_ck_status').val();
		conf_key.title = $('#fe_ck_title').val();
		conf_key.description = $('#fe_ck_desc').val();
		
		if (!conf_key.key.length) {
			return app.badField('#fe_ck_key', "Please enter an Config Key string");
		}
		
		return conf_key;
	}
	
	
});