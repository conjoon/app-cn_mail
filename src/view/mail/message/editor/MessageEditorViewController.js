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
 * The default ViewController for
 * {@link conjoon.cn_mail.view.mail.message.editor.MessageEditor}.
 *
 */
Ext.define('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {

    extend : 'Ext.app.ViewController',

    alias : 'controller.cn_mail-mailmessageeditorviewcontroller',

    control : {
        'cn_mail-mailmessageeditorhtmleditor > toolbar > cn_comp-formfieldfilebutton' : {
            change : 'onFormFileButtonChange'
        },

        '#showCcBccButton' : {
            click : 'onShowCcBccButtonClick'
        },

        '#sendButton' : {
            click : 'onSendButtonClick'
        },

        '#saveButton' : {
            click : 'onSaveButtonClick'
        },
        'cn_mail-mailmessageeditor' : {
            beforedestroy                               : 'onMailMessageEditorBeforeDestroy',
            'cn_mail-mailmessagesaveoperationcomplete'  : 'onMailMessageSaveOperationComplete',
            'cn_mail-mailmessagesaveoperationexception' : 'onMailMessageSaveOperationException',
            'cn_mail-mailmessagesavecomplete'           : 'onMailMessageSaveComplete',
            'cn_mail-mailmessagebeforesave'             : 'onMailMessageBeforeSave',
            'cn_mail-mailmessagebeforesend'             : 'onMailMessageBeforeSend',
            'cn_mail-mailmessagesendcomplete'           : 'onMailMessageSendComplete',
            'cn_mail-mailmessagesendexception'          : 'onMailMessageSendException'
        }
    },

    /**
     * @parivate
     */
    deferTimers : null,

    /**
     * Helper to indicate the number of times the attachmentlistWrap was entered/
     * leaved during the drag/drop process to properly add/remove styles.
     * @type {Integer=0} dragEnterCount
     * @private
     */
    dragEnterCount : 0,


    /**
     * Makes sure #installDragDropListeners is called as soon as the controller's
     * editor was rendered.
     */
    init : function() {
        var me   = this,
            view = me.getView();

        me.deferTimers = {};
        view.on('afterrender', me.installDragDropListeners, me, {single : true});
    },


    /**
     * Callback for the MailMessageEditor's destroy event. Clears the defer timers.
     *
     */
    onMailMessageEditorBeforeDestroy : function() {
        var me   = this,
            view = me.getView();

        for (var i in me.deferTimers) {
            if (!me.deferTimers.hasOwnProperty(i)) {
                continue;
            }

            window.clearTimeout(me.deferTimers[i]);
            delete me.deferTimers[i];
        }

        if (view.busyMask) {
            view.busyMask.destroy();
            view.busyMask = null;
        }
    },


    /**
     * Helper method to register the drag & drop listeners to the embedded
     * container wrapping the AttachmentList.
     *
     * @private
     */
    installDragDropListeners : function() {
        var me             = this,
            view           = me.getView(),
            attachmentWrap = view.down('#attachmentListWrap').el;

        view.mon(
            attachmentWrap, 'dragenter', me.onAttachmentListWrapDragEnter, me);
        view.mon(
            attachmentWrap, 'dragleave', me.onAttachmentListWrapDragLeave, me);
        view.mon(
            attachmentWrap, 'dragend',   me.onAttachmentListWrapDragEnd,   me);
        view.mon(
            attachmentWrap, 'drop',      me.onAttachmentListWrapDrop,      me);
    },


    /**
     * Helper function to add/remove the "hover" css class of the
     * attachmentListWrap.
     *
     * @param {Boolean} isHover true to add the css class, false to remove it.
     * @param {Boolean} forceReset true to reset #dragEnterCount to 0
     */
    registerAttachmentListWrapEnter : function(isHover, forceReset) {
        var me   = this,
            view = me.getView();

        if (isHover) {
            me.dragEnterCount++;
        } else {
            me.dragEnterCount--;
        }

        me.dragEnterCount = me.dragEnterCount < 0 || forceReset === true
                            ? 0
                            : me.dragEnterCount;

        view.down('#attachmentListWrap').el[
            me.dragEnterCount ? 'addCls' : 'removeCls'
        ]('hover')
    },


    /**
     * Callback for the dragenter event of the attachmentListWrap.
     * Makes sure the hoverAttachmentListWrap is being called.
     *
     * @param {Ext.util.Event} e
     */
    onAttachmentListWrapDragEnter : function(e) {
        e.preventDefault();

        var me = this;
        me.registerAttachmentListWrapEnter(true);
    },


    /**
     * Callback for the dragleave event of the attachmentListWrap.
     * Makes sure the hoverAttachmentListWrap is being called if,
     * and only if dragEnterCount is equal or less than 0.
     *
     * @param {Ext.util.Event} e
     */
    onAttachmentListWrapDragLeave : function(e) {
        e.preventDefault();

        var me = this;
        me.registerAttachmentListWrapEnter(false);
    },


    /**
     * Callback for the attachmentListWrap's dragend event.
     *
     * @param {Ext.util.Event} e
     */
    onAttachmentListWrapDragEnd : function(e) {
        e.preventDefault();

        var me = this;
        me.registerAttachmentListWrapEnter(false, true);
    },


    /**
     * Callback for the attachmentListWrap's drop event.
     *
     * @param {Ext.util.Event} e
     */
    onAttachmentListWrapDrop : function(e) {
        e.preventDefault();

        var me           = this,
            dataTransfer = e.event.dataTransfer;

        me.registerAttachmentListWrapEnter(false, true);

        if (dataTransfer && dataTransfer.files) {
            me.addAttachmentsFromFileList(dataTransfer.files);
        }
    },


    /**
     * Adds the files available in fileList to the editor#s attachmentList.
     *
     * @param {FileList} fileList
     *
     * @private
     */
    addAttachmentsFromFileList : function(fileList) {
        var me             = this,
            view           = me.getView(),
            attachmentList = view.down('cn_mail-mailmessageeditorattachmentlist');

        for (var i = 0, len = fileList.length; i < len; i++) {
            attachmentList.addAttachment(fileList[i]);
        }
    },


    /**
     * Callback for the change event of this view's {@link conjoon.cn_comp.form.FileButton}.
     *
     * @param {conjoon.cn_comp.form.FileButton} fileButton
     * @param {Ext.event.Event} evt
     * @param {String} value
     * @param {FileList} fileList
     *
     * @see conjoon.cn_mail.view.mail.message.editor.AttachmentList#addAttachment
     */
    onFormFileButtonChange : function(fileButton, evt, value, fileList) {
        var me = this;
        me.addAttachmentsFromFileList(fileList);
    },


    /**
     * Delegates showing the CC/BCC fields to the view.
     *
     * @param {Ext.Button}
     */
    onShowCcBccButtonClick : function(btn) {

        var me   = this,
            view = me.getView();

        view.showCcBccFields(view.down('#ccField').isHidden());
    },


    /**
     * @param {Ext.Button} btn
     */
    onSendButtonClick : function(btn) {

        var me = this;

        me.configureAndStartSaveBatch(true);
    },


    /**
     * Saves the current MessageDraft.
     *
     * @param {Ext.Button} btn
     */
    onSaveButtonClick : function(btn) {

        var me = this;

        me.configureAndStartSaveBatch();
    },


    /**
     * Callback for a single operation's complete event.
     *
     * @param {conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     * @param {Ext.data.operation.Operation} operation
     */
    onMailMessageSaveOperationComplete : function(editor, messageDraft, operation) {

        var me   = this,
            view = me.getView(),
            vm   = view.getViewModel();

        me.setViewBusy(operation);
    },


    /**
     * Callback for a single operation's exception event.
     *
     * @param {conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     * @param {Ext.data.operation.Operation} operation
     */
    onMailMessageSaveOperationException : function(editor, messageDraft, operation) {
        // tbd return value is only for tests
        return false;
    },


    /**
     * Callback for a successfull processing of a complete batch.
     * Will trigger #sendMessage as soon as the operation completes.
     *
     * @param {conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     * @param {Ext.data.operation.Operation} operation
     * @param {Boolean} isSending
     */
    onMailMessageSaveComplete : function(editor, messageDraft, operation, isSending) {

        var me   = this,
            view = me.getView();

        me.setViewBusy(operation, 1);

        if (isSending !== true) {
            me.deferTimers['savecomplete'] = Ext.Function.defer(
                me.endBusyState, 750, me, ['saving']);
        } else {
            me.deferTimers['savecompletesend'] = Ext.Function.defer(function() {
                var me = this;
                me.endBusyState('saving');
                me.sendMessage();
            }, 750, me);
        }

    },


    /**
     * Callback for this view's beforesave event.
     * If the viewModel's isSubjectRequired is set to true and the subject is
     * empty, the saveing process will be cancelled and the user is prompted
     * for a subject. If it's still empty, isSubjectRequired will be set to false
     * and the process will be triggered again. The controller will not ask for a
     * subject then.
     *
     * @param {conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     * @param {Boolean} true if the event is part of a "send" process, i.e. the
     * message is currently being saved before it gets send.
     */
    onMailMessageBeforeSave : function(editor, messageDraft, isSending) {
        var me   = this,
            view = me.getView(),
            vm   = view.getViewModel();

        if (!Ext.String.trim(messageDraft.get('subject')) &&
            vm.get('isSubjectRequired') === true) {
            view.showSubjectMissingNotice(messageDraft, Ext.Function.bindCallback(
                function(isSending, viewModel, buttonId, value) {
                    var me = this;

                    if (buttonId !== 'okButton') {
                        return;
                    }

                    if (!Ext.String.trim(value)) {
                        viewModel.set('isSubjectRequired', false);
                    }

                    me.configureAndStartSaveBatch(isSending);
                },
                me,
                [isSending, vm]
            ));
            return false;
        }
        vm.set('isSaving', true);

        /**
         * @i18n
         */
        view.setBusy({msg : 'Saving Mail', msgAction : 'Stand by...'});
    },


    /**
     * Callback for the view's beforesend event.
     *
     * @param {conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     *
     * @return {Boolean} false if the message could not validated and sending it
     * should be cancelled
     */
    onMailMessageBeforeSend : function(editor, messageDraft) {
        var me   = this,
            view = me.getView(),
            vm   = view.getViewModel();

        if (!messageDraft.get('to').length &&
            !messageDraft.get('cc').length &&
            !messageDraft.get('bcc').length) {

            view.showAddressMissingNotice(messageDraft);
            return false;
        }

        vm.set('isSending', true);

        /**
         * @i18n
         */
        view.setBusy({msg : 'Sending Mail', msgAction : 'Please wait...'});
    },


    /**
     * Callback for the view's sendcomplete event.
     *
     * @param {conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     */
    onMailMessageSendComplete : function(editor, messagDraft) {
        var me   = this,
            view = me.getView(),
            vm   = view.getViewModel();

        /**
         * @i18n
         */
        view.setBusy({msgAction : 'Message sent successfully.', progress : 1});
        me.deferTimers['sendcomplete'] = Ext.Function.defer(
            view.close, 1000, view);
    },

    /**
     * Callback for the view's sendexception event.
     *
     * @param {conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     */
    onMailMessageSendException : function(editor, messageDraft) {
        var me   = this,
            view = me.getView(),
            vm   = view.getViewModel();

        vm.set('isSending', false);

        /**
         * @i18n
         */
        view.setBusy({msgAction : 'Error :(', progress : 1});
        me.deferTimers['sendexception'] = Ext.Function.defer(
            me.endBusyState, 750, me, ['sending']);
    },


    privates : {

        /**
         * Sends the current MessageDraft and fires the events
         * cn_mail-mailmessagebeforesend and cn_mail-mailmessagesendcomplete (or
         * cn_mail-mailmessagesendexception if the send-process was not successfull).
         * This method is part of a callback that gets called by onMailMessageSaveComplete,
         * if the save process was part of a request to send teh MessageDraft.
         *
         * Returns {Boolean} true if sending the message was delegated to the backend,
         * false if the cn_mail-mailmessagebeforesend event cancelled the process.
         *
         * @private
         */
        sendMessage : function() {

            var me           = this,
                view         = me.getView(),
                vm           = view.getViewModel(),
                messageDraft = vm.get('messageDraft');

            if (messageDraft.dirty || messageDraft.phantom) {
                Ext.raise({
                    msg : "Cannot send MessageDraft: Needs to get saved before.",
                    cls : Ext.getClassName(me)
                })
            }

            if (view.fireEvent('cn_mail-mailmessagebeforesend', view, messageDraft) === false) {
                return false;
            };

            Ext.Ajax.request({
                url    : './cn_mail/SendMessage',
                params : {
                    id : messageDraft.get('id')
                }
            }).then(
                function(response, opts) {
                    view.fireEvent('cn_mail-mailmessagesendcomplete', view, messageDraft);
                },
                function(response, opts) {
                    view.fireEvent('cn_mail-mailmessagesendexception', view, messageDraft);

                }
            );
        },


        /**
         * Configures and starts the save batch of the session of the MessageEditor.
         *
         * @param {Boolean} isSend true to indicate that this operation requested
         * is a "send" operation of the MessageDraft. This will additionally trigger
         * the send-process once the draft was successfully saved.
         *
         * @private
         */
        configureAndStartSaveBatch : function(isSend) {

            var me           = this,
                view         = me.getView(),
                vm           = view.getViewModel(),
                session      = view.getSession(),
                messageDraft = vm.get('messageDraft'),
                saveBatch;

            // will trigger a save in the case the date value changes.
            messageDraft.set('date', new Date());

            saveBatch = session.getSaveBatch();

            saveBatch.setPauseOnException(true);

            saveBatch.on({
                exception : function(batch, operation) {
                    view.fireEvent('cn_mail-mailmessagesaveoperationexception',
                        view, messageDraft, operation);
                },
                operationcomplete : function(batch, operation) {
                    view.fireEvent('cn_mail-mailmessagesaveoperationcomplete',
                        view, messageDraft, operation);
                },
                scope  : view,
                single : true
            });


            saveBatch.on('complete', function(batch, operation) {
                view.fireEvent(
                    'cn_mail-mailmessagesavecomplete',
                    view, messageDraft,
                    operation,
                    isSend === true
                );
            }, view, {single : true});

            if (view.fireEvent('cn_mail-mailmessagebeforesave', view, messageDraft, isSend === true) === false) {
                return false;
            }
            saveBatch.start();
        },


        /**
         * Helper function to finish the busy state of the MailEditor.
         *
         * @param {String} type The type of the busy-operation, i.e. 'sending'
         * or 'saving'
         *
         * @private
         *
         * @throws if type doe snot equal to 'sending' or 'saving'
         */
        endBusyState : function(type) {

            var me   = this,
                view = me.getView(),
                vm   = view.getViewModel();

            switch (type) {
                case 'sending':
                    vm.set('isSending', false);
                    break;
                case 'saving':
                    vm.set('isSaving', false);
                    break;
                default:
                    Ext.raise({
                        msg  : 'Unknown busy type.',
                        type : type,
                        cls  : Ext.getClassName(me)
                    })
            }

            view.setBusy(false);
        },


        /**
         * Helper function to update the view's busy state.
         *
         * @param {Ext.data.operatin.Operation} operation
         * @param {Number} progress
         *
         * @private
         */
        setViewBusy : function(operation, progress) {

            var me   = this,
                view = me.getView();

            view.setBusy({
                /**
                 * @i18n
                 */
                msgAction : Ext.String.format("{1} {0}.",
                            operation.getAction() == 'destroy'
                                                     ? 'removed'
                                                     : 'saved',
                            operation.entityType.entityName
                ),
                progress : progress
            });
        }


    }
});