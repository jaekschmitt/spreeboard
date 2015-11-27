(function() {

    angular
        .module('main')
        .filter('stripMarkdown', stripMarkdown);

    function stripMarkdown() {
        return function(value) {
            var output = value;

            try {

                output = output
                    // Remove HTML tags
                    .replace(/<(.*?)>/g, '$1')
                    // Remove setext-style headers
                    .replace(/^[=\-]{2,}\s*$/g, '')
                    // Remove footnotes?
                    .replace(/\[\^.+?\](\: .*?$)?/g, '')
                    .replace(/\s{0,2}\[.*?\]: .*?$/g, '')
                    // Remove images
                    .replace(/\!\[.*?\][\[\(].*?[\]\)]/g, '')
                    // Remove inline links
                    .replace(/\[(.*?)\][\[\(].*?[\]\)]/g, '$1')
                    // Remove reference-style links?
                    .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '')
                    // Remove atx-style headers
                    .replace(/^\#{1,6}\s*([^#]*)\s*(\#{1,6})?/gm, '$1')
                    .replace(/([\*_]{1,2})(\S.*?\S)\1/g, '$2')
                    .replace(/(`{3,})(.*?)\1/gm, '$2')
                    .replace(/^-{3,}\s*$/g, '')
                    .replace(/`(.+?)`/g, '$1')
                    .replace(/\n{2,}/g, '\n\n')
                    .replace('- [ ]', '')
                    .replace('- [x]', '');
            } catch(e) {
                console.error(e);
                return value;
            }

            return output;
        }
    }

})();