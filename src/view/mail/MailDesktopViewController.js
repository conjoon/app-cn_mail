/**
 * conjoon
 * (c) 2007-2017 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2017 Thorsten Suckow-Homberg/conjoon.org
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
 * This is the view controller for {@link conjoon.cn_mail.view.mail.MailDesktopView}.
 * It mainly provides and delegates event handling between the embedded views.
 *
 * The routes configuration used here can be found in the PackageController.
 */
Ext.define('conjoon.cn_mail.view.mail.MailDesktopViewController', {

    extend : 'Ext.app.ViewController',

    requires : [
        'conjoon.cn_mail.view.mail.message.reader.MessageView',
        'conjoon.cn_mail.view.mail.message.editor.MessageEditor',
        'conjoon.cn_mail.model.mail.message.MessageItem',
        'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel'
    ],

    alias : 'controller.cn_mail-maildesktopviewcontroller',

    control : {

        'cn_mail-maildesktopview' : {
            'tabchange' : 'onTabChange'
        },

        'cn_mail-maildesktopview > cn_mail-mailmessagereadermessageview' : {
            'cn_mail-mailmessageitemread' : 'onMessageItemRead'
        },
        'cn_mail-mailmessagegrid' : {
            'rowdblclick' : 'onMailMessageGridDoubleClick'
        }
    },

    /**
     * @private
     */
    mailInboxView : null,

    /**
     * Used to compute valid itemIds for MessageEditor tabs, which can be valid
     * in case routing ids with special characters (e.g. mailto-links) appear.
     * @private
     */
    editorIdMap : null,


    /**
     * Creates a new mail editor for writing an email message, adding the
     * cn_href-property 'cn_mail/message/compose/[id]' to the tab.
     * This controller method distinguishes between to datatypes specified with
     * id: Number and String. If id is a number, it is assumed that a regular,
     * blank composer instance should be opened. If id is a string, it is assumed
     * that the passed id is part of the value of the mailto: protocol, and the
     * created MessageEitor will be adjusted to hold the information as specified
     * in the string.
     *
     * @param {Number/String} id an id to be able to track this MessageEditor later on
     * when routing is triggered
     *
     * @return conjoon.cn_mail.view.mail.message.editor.MessageEditor
     *
     * @throws if no valid id was specified (bubbles exceptions from
     * #getItemIdForMessageEditor and #getCnHrefForMessageEditor)
     */
    showMailEditor : function(id) {
        var me      = this,
            view    = me.getView(),
            newView, cn_href, itemId;

        itemId  = me.getItemIdForMessageEditor(id);
        cn_href = me.getCnHrefForMessageEditor(id);

        newView = view.down('#' + itemId);

        if (!newView) {
            newView = view.add({
                xtype   : 'cn_mail-mailmessageeditor',
                itemId  : itemId,
                cn_href : cn_href
            });
        }

        view.setActiveTab(newView);

        return newView;
    },

    /**
     * Tries to find an existing MessageView opened in the view and focus it,
     * or create a new one by adding it to the view.
     * The associated messageItem record will be queried in the MessageGrid and
     * reused for the new view if possible.
     *
     * @param {String} messageId The id of the message that should be shown
     * in a MessageView.
     *
     * @see {conjoon.cn_mail.view.mail.MailDesktopViewController#showMailMessageViewFor}
     */
    showMailMessageViewFor : function(messageId) {

        var me      = this,
            view    = me.getView(),
            itemId  = 'cn_mail-mailmessagereadermessageview-' + messageId,
            newView = view.down('#' + itemId),
            msgGrid = view.down('cn_mail-mailmessagegrid'),
            store   = msgGrid ? msgGrid.getStore(): null,
            recInd  = store ? store.findExact('id', messageId + '') : null;

        if (!newView) {
            newView = view.add({
                xtype   : 'cn_mail-mailmessagereadermessageview',
                itemId  : itemId,
                cn_href : 'cn_mail/message/read/'  + messageId
            });

           if (recInd > -1) {
                newView.setMessageItem(store.getAt(recInd));
           } else {
                // most likely opened via deeplinking
                conjoon.cn_mail.model.mail.message.MessageItem.load(messageId, {
                    success : function(record) {
                        newView.setMessageItem(record);
                    }
                });
            }
        }

        me.getView().setActiveTab(newView);
    },

    /**
     * Callback for MessageViews' cn_mail-mailmessageitemread events.
     * Events get forwarded to this view's embedded InboxView's controller.
     *
     * @param {Array|conjoon.cn_mail.model.mail.message.MessageItem} messageItemRecords
     *
     * @see {conjoon.cn_mail.view.mail.inbox.InboxViewController#onMessageItemRead}
     */
    onMessageItemRead : function(messageItemRecords) {

        var me = this;

        if (!me.mailInboxView) {
            me.mailInboxView = me.getView().down('cn_mail-mailinboxview');
        }

        me.mailInboxView.getController().onMessageItemRead(messageItemRecords);
    },

    /**
     * Callback for the embedded MessageGrid's doubleclick event.
     * Redirects to this PackageController's cn_mail/message/read/:id route.
     *
     * @param {conjoon.cn_mail.view.mail.message.MessageGrid} grid
     * @param {conjoon.cn_mail.model.mail.message.MessageItem} record
     */
    onMailMessageGridDoubleClick : function(grid, record) {

        var me = this;

        me.redirectTo('cn_mail/message/read/' + record.get('id'));
    },

    /**
     * Callback for the tabchange event of this controller's view.
     * Will make sure to properly update the hash of the location for
     * browsing through the history of this package views.
     *
     * @param tabPanel
     * @param newCard
     * @param oldCard
     * @param eOpts
     */
    onTabChange : function(tabPanel, newCard, oldCard, eOpts) {

        var me = this;

        if (newCard.cn_href){
            Ext.History.add(newCard.cn_href);
        }
    },


    /**
     * Computes a valid itemId to use with an MessageEdit instance. This is needed
     * since id might be string containing special chars.
     * This method is guaranteed one and the same id for one and the same specified
     * id during the lifetime of this instance. ids so not persist over sessions.
     *
     * @param {String} id
     *
     * @return {String}
     *
     * @private
     */
    getItemIdForMessageEditor : function(id) {

        var me, newId;

        if (!id || (!Ext.isString(id) && !Ext.isNumber(id))) {
            Ext.raise({
                id  : id,
                msg : "\"id\" is not a valid value"
            })
        }

        me    = this;
        newId = 'cn_mail-mailmessageeditor-' + Ext.id();

        if (!me.editorIdMap) {
            me.editorIdMap = {};
        }

        if (!me.editorIdMap[id]) {
            me.editorIdMap[id] = newId;
        }

        return  me.editorIdMap[id];
    },


    /**
     * Returns a cn_href value to use with a MessageEditor for proper routing.
     *
     * @param {Mixed} id
     *
     * @return {String}
     *
     * @private
     */
    getCnHrefForMessageEditor : function(id) {

        if (!id || (!Ext.isString(id) && !Ext.isNumber(id))) {
            Ext.raise({
                id  : id,
                msg : "\"id\" is not a valid value"
            })
        }

        return 'cn_mail/message/compose/' + id
    }

});
