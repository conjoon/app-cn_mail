/**
 * conjoon
 * (c) 2007-2018 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2018 Thorsten Suckow-Homberg/conjoon.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Base HtmlEditor for the {@link conjoon.cn_mail.view.mail.message.editor.MessageEditor}.
 * Adds an "Add attachment"-button {@link coon.comp.form.field.FileButton} to
 * the toolbar of the editor.
 */
Ext.define('conjoon.cn_mail.view.mail.message.editor.HtmlEditor', {

    extend : 'Ext.form.field.HtmlEditor',

    requires : [
        'coon.comp.form.field.FileButton'
    ],

    alias : 'widget.cn_mail-mailmessageeditorhtmleditor',

    /**
     * @inheritdoc
     */
    createToolbar: function(){

        var me   = this,
            tbar = me.callParent(arguments);

        tbar.add('-');
        tbar.add({
            xtype   : 'cn_comp-formfieldfilebutton',
            iconCls : 'x-fa fa-paperclip',
            tooltip : {
                title : 'Add Attachment(s)...',
                text  : 'Add one or more attachments to this message.',
                cls   : Ext.baseCSSPrefix + 'html-editor-tip'
            }
        });

        return tbar;
    },


    /**
     * @see conjoon/app-cn_mail#68
     * @inheritdoc
     */
    getToolbarCfg: function(){
        const me  = this,
              cfg = me.callParent(arguments);

        cfg.listeners.click = function(evt, source) {
            if (source.className.indexOf('x-form-file-input') !== -1) {
                // if we prevent default when file button is clicked (see below),
                // no file dialog is shown. We have to exit here.
                return;
            }

            // default behavior as defined by ExtJS6.2.0
            evt.preventDefault();
        };

        return cfg;
    }

});
