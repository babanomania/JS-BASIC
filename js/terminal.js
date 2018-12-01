class Terminal {

    constructor( ul_id, row_length){
        this.term_ul = document.querySelector(ul_id);
        this.row_length = row_length;
        this.row_buffer = [];
        this.input_buffer = '';
    }

    print( value ){
        this.row_buffer.push( value );
        this.show( this.row_length );
    }

    input( value, var_name, onreceived ){

        this.show( this.row_length - 1 );
        
        var li_node = document.createElement("LI"); 
        var p_node = document.createElement("P"); 
        
        li_node.appendChild(p_node);

        if( value ){
            var text_node = document.createTextNode(value + ' ? ');
            p_node.appendChild(text_node);
            this.input_buffer = value + ' ? ';

        } else {
            var text_node = document.createTextNode(' ? ');
            p_node.appendChild(text_node);
            this.input_buffer = ' ? ';
        }
        
        var input_node = document.createElement("INPUT");
        var att_type = document.createAttribute("type");
        att_type.value = "text";
        var att_id = document.createAttribute("id");
        att_id.value = "term_input";
        
        input_node.setAttributeNode(att_type);  
        input_node.setAttributeNode(att_id); 
        p_node.appendChild(input_node); 

        this.term_ul.appendChild( li_node );

        var instance  = this;
        var term_input = document.querySelector('#term_input');
        term_input.addEventListener('keyup', function (event) {
            if (event.keyCode === 13) {

                //console.log( 'got value => ', this.value );
                onreceived( var_name, this.value );
                instance.print( instance.input_buffer + this.value );
                instance.input_buffer = '';
            }
        });
   
    }

    show( buffer_length ){
        
        this.term_ul.innerHTML = '';

        var starting_index = this.row_buffer.length - buffer_length;
        var starting_index = starting_index < 0 ? 0 : starting_index;
        for (var i = starting_index; i < this.row_buffer.length; i++) {
            
            var li_node = document.createElement("LI"); 
            var p_node = document.createElement("P"); 
            var text_node = document.createTextNode(this.row_buffer[i]);
            
            p_node.appendChild(text_node);
            li_node.appendChild(p_node);
            this.term_ul.appendChild( li_node );
        }

    }

    clear(){
        this.row_buffer = [];
        this.input_buffer = '';
        this.show( this.row_length );
    }

}