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

describe('conjoon.cn_mail.view.mail.MailDesktopViewControllerTest', function(t) {

    var panel,
        getRecordCollection = function() {
            return [
                Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                    id           : 1,
                    mailFolderId : 1
                }),
                Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                    id           : 2,
                    mailFolderId : 1
                }),
                Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                    id           : 3,
                    mailFolderId : 2
                }),
                Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                    id           : 4,
                    mailFolderId : 2
                }),
                Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                    id           : 5,
                    mailFolderId : 2
                })
            ];
        };

    t.afterEach(function() {

    });


    t.it("Should create the ViewController and run basic checks", function(t) {
        var viewController = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );

        t.expect(viewController.alias).toContain('controller.cn_mail-maildesktopviewcontroller');
        t.expect(viewController instanceof Ext.app.ViewController).toBe(true);

        viewController.destroy();
    });


    t.it("Should make sure that cn_mail-mailmessageitemread events are only considered " +
        "when fired as direct children of the MailDesktopView", function(t) {

        var _testMailFolders = null,
            viewController = Ext.create(
                'conjoon.cn_mail.view.mail.MailDesktopViewController'
            );

        viewController.onMessageItemRead = function(messageItemRecords) {
            _testMailFolders = messageItemRecords;
        };

        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : viewController,
            width  : 800,
            height : 600,
            items : [{
                xclass : 'conjoon.cn_mail.view.mail.inbox.InboxView'
            }]
        });

        panel.down('cn_mail-mailinboxview').down('cn_mail-mailmessagereadermessageview')
            .fireEvent('cn_mail-mailmessageitemread', getRecordCollection());

        t.expect(_testMailFolders).toBe(null);

        var mv = panel.add({
            xclass : 'conjoon.cn_mail.view.mail.message.reader.MessageView'
        });

        mv.fireEvent('cn_mail-mailmessageitemread', getRecordCollection());

        t.expect(_testMailFolders).not.toBe(null);

        panel.destroy();
        panel = null;
    });

    t.it("Should make sure that onMailMessageGridDoubleClick works properly", function(t) {

        var ctrl = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
            ),
            records = getRecordCollection();

        ctrl.onMailMessageGridDoubleClick(null, records[0]);
        t.expect(Ext.util.History.getToken()).toBe('cn_mail/message/read/' + records[0].get('id'));

        ctrl.onMailMessageGridDoubleClick(null, records[1]);
        t.expect(Ext.util.History.getToken()).toBe('cn_mail/message/read/' + records[1].get('id'));

        ctrl.destroy();
        ctrl = null;
    });

    t.it("Should make sure that onTabChange works properly", function(t) {

        var ctrl = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );

        ctrl.onTabChange(null, {cn_href : 'somehash'});
        t.expect(Ext.util.History.getToken()).toBe('somehash');

        ctrl.onTabChange(null, {cn_href : 'somehash2'});
        t.expect(Ext.util.History.getToken()).toBe('somehash2');

        ctrl.destroy();
        ctrl = null;

    });

    t.it("Should make sure that showMailMessageViewFor works properly", function(t) {


        t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {

            var panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
                    width    : 800,
                    height   : 600,
                    renderTo : document.body
                }),
                ctrl  = panel.getController(),
                store, rec, rec2;

            t.waitForMs(500, function() {

                panel.down('cn_mail-mailfoldertree').setSelection(panel.down('cn_mail-mailfoldertree').getStore().getAt(1));

                t.waitForMs(500, function() {

                    store = panel.down('cn_mail-mailmessagegrid').getStore();
                    rec   = store.getAt(0);
                    rec2  = store.getAt(1);

                    t.expect(rec.get('id')).toBe(rec.get('id') + '');

                    // existing records reused from store
                    t.expect(panel.down('#cn_mail-mailmessagereadermessageview-' + rec.get('id'))).toBe(null);
                    ctrl.showMailMessageViewFor(rec.get('id'));
                    t.expect(panel.down('#cn_mail-mailmessagereadermessageview-' + rec.get('id'))).not.toBe(null);
                    t.expect(panel.getActiveTab()).toBe(panel.down('#cn_mail-mailmessagereadermessageview-'  + rec.get('id')));

                    t.expect(panel.down('#cn_mail-mailmessagereadermessageview-' + rec2.get('id'))).toBe(null);
                    ctrl.showMailMessageViewFor( + rec2.get('id'));
                    t.expect(panel.down('#cn_mail-mailmessagereadermessageview-' + rec2.get('id'))).not.toBe(null);
                    t.expect(panel.getActiveTab()).toBe(panel.down('#cn_mail-mailmessagereadermessageview-'  + rec2.get('id')));

                    t.expect(panel.down('#cn_mail-mailmessagereadermessageview-' + rec.get('id'))).not.toBe(null);
                    ctrl.showMailMessageViewFor(rec.get('id'));
                    t.expect(panel.getActiveTab()).toBe(panel.down('#cn_mail-mailmessagereadermessageview-' + rec.get('id')));

                    // remote Loading
                    t.expect(store.findExact('id', '1')).toBe(-1);
                    t.expect(panel.down('#cn_mail-mailmessagereadermessageview-1')).toBe(null);
                    ctrl.showMailMessageViewFor(1);

                    t.waitForMs(500, function() {

                        t.expect(panel.getActiveTab()).toBe(panel.down('#cn_mail-mailmessagereadermessageview-1'));


                        t.waitForMs(500, function() {
                            panel.destroy();
                            panel = null;
                        });
                    });

                });
            });
        });
    });


    t.it("getItemIdForMessageEditor()", function(t) {
        var ctrl = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        ), exc, e, tests, res, results = [];

        tests = [{
            expected : 'Exception'
        }, {
            value    : 8797
        }, {
            value    : "8797dssdggddsg"
        }, {
            value    : false,
            expected : 'Exception'
        }, {
            value    : {},
            expected : 'Exception'
        }];

        for (var i = 0, len = tests.length; i < len; i++) {
            exc = e = undefined;
            if (tests[i].expected == 'Exception') {
                try{ctrl.getItemIdForMessageEditor(tests[i].value);}catch(e){
                    exc = e;
                }
                t.expect(exc).toBeDefined();
                t.expect(exc.msg).toContain("valid value");
            } else {
                res = ctrl.getItemIdForMessageEditor(tests[i].value);
                t.expect(res.indexOf('cn_mail-mailmessageeditor-')).toBe(0);
                results[i] = res;
            }
        }

        for (var i = 0, len = tests.length; i < len; i++) {
            if (tests[i].expected == 'Exception') {
                continue;
            } else {
                t.expect(ctrl.getItemIdForMessageEditor(tests[i].value)
                ).toBe(results[i]);
            }
        }
    });


    t.it("getCnHrefForMessageEditor()", function(t) {
        var ctrl = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        ), exc, e, tests;

        tests = [{
            expected : 'Exception'
        }, {
            value    : 8797,
            expected : 'cn_mail/message/compose/8797'
        }, {
            value    : "8797dssdggddsg",
            expected : 'cn_mail/message/compose/8797dssdggddsg'
        }, {
            value    : false,
            expected : 'Exception'
        }, {
            value    : {},
            expected : 'Exception'
        }];

        for (var i = 0, len = tests.length; i < len; i++) {
            exc = e = undefined;
            if (tests[i].expected == 'Exception') {
                try{ctrl.getCnHrefForMessageEditor(tests[i].value);}catch(e){
                    exc = e;
                }
                t.expect(exc).toBeDefined();
                t.expect(exc.msg).toContain("valid value");
            } else {
                t.expect(ctrl.getCnHrefForMessageEditor(tests[i].value)).toBe(
                    tests[i].expected);
            }
        }
    });


    t.it("showMailEditor()", function(t) {

        var panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
                width    : 800,
                height   : 600,
                renderTo : document.body
            }),
            ctrl  = panel.getController(),
            queryRes, editor, exc, e, editor2;

        try {ctrl.showMailEditor();}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("valid value");

        try {ctrl.showMailEditor(true);}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("valid value");

        try {ctrl.showMailEditor(false);}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("valid value");

        queryRes = Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel);
        t.expect(queryRes.length).toBe(0);

        editor = ctrl.showMailEditor(1);
        t.isInstanceOf(editor, 'conjoon.cn_mail.view.mail.message.editor.MessageEditor');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel)[0]).toBe(editor);

        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(1);
        ctrl.showMailEditor(2);
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(2);

        editor2 = ctrl.showMailEditor(1);
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(2);
        t.expect(editor2).toBe(editor);

        editor = ctrl.showMailEditor('test');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(3);

        editor2 = ctrl.showMailEditor('test1');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(4);
        t.expect(editor).not.toBe(editor2);

        editor2 = ctrl.showMailEditor('test');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(4);
        t.expect(editor).toBe(editor2);

        panel.destroy();
        panel = null;
    });
});
