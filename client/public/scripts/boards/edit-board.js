(function() {

    function ViewModel(element) {
        var self = this;

        // properties

        this.verticals = ko.observableArray([]);
        this.vertical = ko.observable('');

        // functions
        
        this.add = addVertical;        
        this.remove = removeVertical;

        function addVertical() {            
            if(!self.vertical().length) return;

            self.verticals.push(self.vertical());
            self.vertical('');
        }

        function removeVertical(v) {
            self.verticals.remove(v);
        }

        // private functions

        init();

        function init() {
            ko.applyBindings(this, element);
        }

    }

    $(document).ready(function() {

        var vm = ViewModel(document.getElementById('EditBoard'));
        $('[data-toggle="tooltip"]').tooltip()

    });

})();