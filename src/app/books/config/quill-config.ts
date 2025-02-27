import { QuillConfig } from 'ngx-quill';

export const quillConfig: QuillConfig = {
  modules: {
    toolbar: false,
    keyboard: {
      bindings: {
        'slash': {
          key: 191, // Forward slash key
          handler: function() {
            return false; // We'll handle this in the component
          }
        }
      }
    }
  },
  theme: 'bubble',
  placeholder: ''
}; 