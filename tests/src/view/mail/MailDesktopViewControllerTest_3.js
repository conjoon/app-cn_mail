/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

StartTest(async t => {

    const helper =  t.l8.liquify(t.TestHelper.get(t, window));
    await helper.mockUpMailTemplates().andRun((t) => {

        const TIMEOUT = 1250,
            selectMailFolder = function (panel, storeAt, shouldBeId, t) {

                let folder = storeAt instanceof Ext.data.TreeModel
                    ? storeAt
                    : panel.down("cn_mail-mailfoldertree").getStore().getAt(storeAt);

                let p = folder.parentNode;

                while (p) {
                    p.expand();
                    p = p.parentNode;
                }

                panel.down("cn_mail-mailfoldertree").getSelectionModel()
                    .select(folder);

                if (shouldBeId && t) {
                    t.expect(folder.get("id")).toBe(shouldBeId);
                }

                return folder;

            },
            doubleClickMessage = function (grid, storeAt, shouldEqualToCK, t, cb) {

                let message = grid.getStore().getAt(storeAt);

                if (shouldEqualToCK) {
                    t.expect(message.getCompoundKey().toObject()).toEqual(shouldEqualToCK.toObject());
                }

                t.doubleClick(grid.view.getRow(message), cb);


            },
            createMailDesktopView = function () {
                return Ext.create("conjoon.cn_mail.view.mail.MailDesktopView", {
                    width: 800,
                    height: 600,
                    renderTo: document.body
                });
            };

        t.beforeEach(function () {
            conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable.resetAll();
        });

        t.requireOk("conjoon.dev.cn_mailsim.data.mail.PackageSim", function () {
            t.requireOk("conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey", function () {
                t.requireOk("conjoon.cn_mail.view.mail.MailDesktopView", function (){

                    Ext.ux.ajax.SimManager.init({
                        delay: 1
                    });

                    t.it("app-cn_mail#83 - showMailAccountFor()", function (t) {

                        let panel     = createMailDesktopView(),
                            ctrl      = panel.getController(),
                            accountId = "dev_sys_conjoon_org",
                            accountView;

                        accountView = ctrl.showMailAccountFor(accountId);

                        t.isInstanceOf(accountView, "conjoon.cn_mail.view.mail.account.MailAccountView");

                        t.waitForMs(TIMEOUT, function () {

                            let mailFolder = panel.down("cn_mail-mailfoldertree");

                            t.expect(mailFolder.getSelectionModel().getSelection()[0].getId()).toBe(accountId);

                            t.expect(ctrl.showMailAccountFor("mail_account")).toBe(accountView);

                            t.expect(mailFolder.getSelectionModel().getSelection()[0].getId()).toBe("mail_account");

                            panel.destroy();

                            panel = null;
                        });

                    });


                    t.it("onMailMessageGridRefreshClick()", function (t) {

                        let panel = createMailDesktopView(),
                            ctrl  = panel.getController();

                        let CALLED = false,
                            ISAVAILABLE = true;

                        let tmp = ctrl.getView;

                        t.waitForMs(TIMEOUT, function () {

                            ctrl.getView = function () {
                                return {
                                    down: function () {
                                        return {
                                            getStore: function () {
                                                return ISAVAILABLE ? {
                                                    reload: function () {
                                                        CALLED = true;
                                                    }
                                                } : null;
                                            }
                                        };
                                    }
                                };
                            };

                            t.expect(CALLED).toBe(false);
                            ctrl.onMailMessageGridRefreshClick();
                            t.expect(CALLED).toBe(true);

                            CALLED = false;
                            ISAVAILABLE = false;

                            ctrl.onMailMessageGridRefreshClick();
                            t.expect(CALLED).toBe(false);

                            t.waitForMs(TIMEOUT, function () {

                                ctrl.getView = tmp;

                                panel.destroy();
                                panel = null;
                            });

                        });


                    });


                    t.it("onMailMessageGridRefreshClick() - click event observed", function (t) {

                        let panel     = createMailDesktopView(),
                            ctrl      = panel.getController();

                        t.isCalledOnce("onMailMessageGridRefreshClick", ctrl);

                        t.waitForMs(TIMEOUT, function () {

                            selectMailFolder(panel, 3);

                            t.waitForMs(TIMEOUT, function () {

                                let el = panel.down("cn_mail-mailmessagegrid #cn_mail-mailmessagegrid-refresh");

                                t.click(el, function () {

                                    panel.destroy();
                                    panel = null;

                                });

                            });


                        });
                    });


                    t.it("changes in attachments are reflected across all MessageViews", function (t) {

                        let panel            = createMailDesktopView(),
                            ctrl             = panel.getController(),
                            inboxView        = panel.down("cn_mail-mailinboxview"),
                            inboxMessageView = inboxView.down("cn_mail-mailmessagereadermessageview"),
                            grid             = panel.down("cn_mail-mailmessagegrid");


                        t.waitForMs(TIMEOUT, function () {

                            selectMailFolder(panel, 4, "INBOX.Drafts", t);

                            t.waitForMs(TIMEOUT, function () {

                                // create editor and draft and save it.
                                let editor = ctrl.showMailEditor("foobar", "compose");

                                editor.down("#subjectField").setValue("Test");
                                t.click(editor.down("#saveButton"), function () {

                                    // wait until the message is saved...
                                    t.waitForMs(TIMEOUT, function () {

                                        // go back to messagedraft and make sure newly created message is available
                                        // and selected and viewable in the MessageView
                                        panel.setActiveItem(inboxView);

                                        let compoundKey = editor.getViewModel().get("messageDraft").getCompoundKey();
                                        doubleClickMessage(grid, 0, compoundKey, t,function () {

                                            ctrl.showMailMessageViewFor(compoundKey);

                                            // wait for the MessageView to properly initialize
                                            t.waitForMs(TIMEOUT, function () {

                                                panel.setActiveItem(editor);

                                                editor.down("#subjectField").setValue("foobar");

                                                t.click(editor.down("#saveButton"), function () {

                                                    // wait until the message is saved...
                                                    t.waitForMs(TIMEOUT, function () {

                                                        panel.setActiveItem(inboxView);
                                                        t.expect(grid.getSelectionModel().getSelection().length).toBeTruthy();
                                                        t.expect(grid.getSelectionModel().getSelection()[0].getCompoundKey().toLocalId()).toEqual(
                                                            editor.getViewModel().get("messageDraft").getCompoundKey().toLocalId()
                                                        );

                                                        t.expect(
                                                            grid.view.getRow(grid.getSelectionModel().getSelection()[0]
                                                            ).parentNode.parentNode.className).toContain("selected");

                                                        panel.setActiveItem(editor);

                                                        editor.getViewModel().get("messageDraft").attachments().add(
                                                            Ext.create("conjoon.cn_mail.model.mail.message.DraftAttachment", {text: "foo", type: "image/jpg", size: 5000})
                                                        );

                                                        t.click(editor.down("#saveButton"), function () {

                                                            // wait until the message is saved...
                                                            t.waitForMs(TIMEOUT, function () {

                                                                panel.setActiveItem(inboxView);

                                                                t.expect(
                                                                    inboxMessageView.getViewModel().get("attachmentStore").getRange()[0].getId()
                                                                ).toBe(
                                                                    editor.getViewModel().get("messageDraft").attachments().getRange()[0].getId()
                                                                );

                                                            });

                                                        });
                                                    });

                                                });
                                            });


                                        });

                                    });


                                });

                            });


                        });


                    });


                });});});});});