SCWeb.core.ui.Menu = {
    _menuContainerId: 'menu_container',
    _items: null,

    init: function(callback) {
        var me = this;
        
        // register for translation updates
        SCWeb.core.Translation.registerListener(this);
        
        SCWeb.core.Server.getCommands(function(menuData) {
            me._build(menuData);
            if(callback) {
                callback();
            }
        });
    },

    _build: function(menuData) {

        this._items = [];

        var menuHtml = '<ul class="nav">';

        //TODO: change to children, remove intermediate 'childs'
        if(menuData.hasOwnProperty('childs')) {
            var id;
            var subMenu;
            var i;
            for(i = 0; i < menuData.childs.length; i++) {
                subMenu = menuData.childs[i];
                menuHtml += this._parseMenuItem(subMenu);
            }
        }

        menuHtml += '</ul>';

        $('#' + this._menuContainerId).append(menuHtml);

        this._registerMenuHandler();
    },

    _parseMenuItem: function(item) {

        this._items.push(item.id);

        var item_class = 'dropdown';
        var itemHtml = '';
        if(item.cmd_type == 'atom') {
            itemHtml = '<li class="' + item_class + '"><a id="' + item.id + '"sc_addr="' + item.id + '" class="menu_item ' + item.cmd_type + '" >' + item.id + '</a>';
        } else {
            itemHtml = '<li class="' + item_class + '"><a id="' + item.id + '"sc_addr="' + item.id + '" class="menu_item ' + item.cmd_type + ' dropdown-toggle" data-toggle="dropdown" href="#" >' + item.id + '</a>';
        }


        if(item.hasOwnProperty('childs')) {
            itemHtml += '<ul class="dropdown-menu">';
            var id;
            var subMenu;
            var i;
            for(i = 0; i < item.childs.length; i++) {
                subMenu = item.childs[i];
                itemHtml += this._parseMenuItem(subMenu);
            }
            itemHtml += '</ul>';
        }
        return itemHtml + '</li>';
    },

    _registerMenuHandler: function() {
        $('.menu_item').click(function() {
            
            var sc_addr = $(this).attr('sc_addr');
            // append as argument
            if (SCWeb.core.utils.Keyboard.ctrl) {
                SCWeb.core.Arguments.appendArgument(sc_addr);
            }else{
            
                if ($(this).hasClass('cmd_atom')) {
                    
                    var output_lang = SCWeb.core.ui.Windows.getActiveWindowOtputLanguage();//SCWeb.core.ui.OutputLanguages.getLanguage();
                    
                    if (!output_lang) {
                        alert("There are no any output language selected");
                    }else{
                    
                        var arguments_list = SCWeb.core.Arguments._arguments;
                        var current_window = SCWeb.core.ui.Windows.active_window;
                        if (!current_window) {
                            alert("There are no any active window to output answer");
                        }else{
                            SCWeb.core.Server.doCommand(sc_addr, output_lang, arguments_list, function(data) {
                                SCWeb.core.ui.Windows.sendDataToWindow(current_window, data);
                            });
                        }
                    }
                }
            }
        });
    },
    
    // ---------- Translation listener interface ------------
    updateTranslation: function(namesMap) {
        // apply translation
        $('#menu_container [sc_addr]').each(function(index, element) {
            var addr = $(element).attr('sc_addr');
            if(namesMap[addr]) {
                $(element).text(namesMap[addr]);
            }
        });
        
    },
    
    /**
     * @return Returns list obj sc-elements that need to be translated
     */
    getObjectsToTranslate: function() {
        return this._items;
    }
};
