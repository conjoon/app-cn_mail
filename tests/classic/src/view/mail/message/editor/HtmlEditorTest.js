/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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

describe('conjoon.cn_mail.view.mail.message.editor.HtmlEditorTest', function(t) {

    var view;

    t.afterEach(function() {
        if (view) {
            view.destroy();
            view = null;
        }

    });

    t.beforeEach(function() {
        viewConfig = {
            renderTo : document.body
        }
    });


    t.it("Should create and show the HtmlEditor along with default config checks", function(t) {
        view = Ext.create(
             'conjoon.cn_mail.view.mail.message.editor.HtmlEditor', viewConfig);

        t.expect(view instanceof Ext.form.field.HtmlEditor).toBeTruthy();

        t.expect(view.alias).toContain('widget.cn_mail-mailmessageeditorhtmleditor');

        t.expect(view.down('cn_comp-formfieldfilebutton')).toBeTruthy();
    });


    //@see https://github.com/conjoon/app-cn_mail/issues/2
    t.it("Should fix conjoon/app-cn_mail/issues/2", function(t) {
        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.HtmlEditor', viewConfig);

        t.expect(view.down('cn_comp-formfieldfilebutton').tooltip).toBeDefined();
    });


    t.it("app-cn_mail#68", function(t) {
        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.HtmlEditor', viewConfig);

        let tbar             = view.down('toolbar'),
            DEFAULTPREVENTED = 0,
            listener         = tbar.managedListeners[4],
            preventDefault   = function() {DEFAULTPREVENTED++;},
            evt              = {preventDefault : preventDefault};

        //t.click(fileButton, function() {arguments; debugger;}, null, evt);

        t.expect(listener.ename).toBe("click");

        t.expect(DEFAULTPREVENTED).toBe(0);
        listener.fn(evt, {className : 'foo x-form-file-input stugg'});
        t.expect(DEFAULTPREVENTED).toBe(0);

        listener.fn(evt, {className : ''});
        t.expect(DEFAULTPREVENTED).toBe(1);
        listener.fn(evt, {className : ''});
        t.expect(DEFAULTPREVENTED).toBe(2);
        listener.fn(evt, {className : 'foo x-form-file-input stugg'});
        t.expect(DEFAULTPREVENTED).toBe(2);

    });
});
