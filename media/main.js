//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.


(function () {

    document.querySelector('.convert').addEventListener('click', () => {
        converttimesstamp();
    });

    document.querySelector('.convertdate').addEventListener('click', () => {
        convertdatetimesstamp();
    });
    
    document.querySelector('#op').addEventListener('click', () => {
        opmanual();
    });

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'converttimesstamp':
                {
                    converttimesstamp();
                    break;
                }
        }
    });

    /**
     * @param {Array<{ value: string }>} colors
     */
    function updateColorList(colors) {
        const ul = document.querySelector('.color-list');
        ul.textContent = '';
        for (const color of colors) {
            const li = document.createElement('li');
            li.className = 'color-entry';

            const colorPreview = document.createElement('div');
            colorPreview.className = 'color-preview';
            colorPreview.style.backgroundColor = `#${color.value}`;
            colorPreview.addEventListener('click', () => {
                onColorClicked(color.value);
            });
            li.appendChild(colorPreview);

            const input = document.createElement('input');
            input.className = 'color-input';
            input.type = 'text';
            input.value = color.value;
            input.addEventListener('change', (e) => {
                const value = e.target.value;
                if (!value) {
                    // Treat empty value as delete
                    colors.splice(colors.indexOf(color), 1);
                } else {
                    color.value = value;
                }
                updateColorList(colors);
            });
            li.appendChild(input);

            ul.appendChild(li);
        }

    }

    /** 
     * @param {string} color 
     */

    /**
     * @returns string
     */
    function getNewCalicoColor() {
        const colors = ['020202', 'f1eeee', 'a85b20', 'daab70', 'efcb99'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function date(stringtxt, unixtimestamp,lang,zone) {
        if(typeof unixtimestamp === 'undefined') unixtimestamp = ((new Date()).getTime() / 1000);
        if(typeof zone === 'undefined') zone = (((new Date().getTimezoneOffset()) - 180) * 60);
        if(stringtxt == 'now') return unixtimestamp;
        let t = parseInt(String(unixtimestamp).replace(/[^0-9]/gi,'')) + zone;
        let d = new Date(t * 1000);
        
            let w = parseInt(d.getDay());
                if(w == 0) q = 'Dom'; if(w == 1) q = 'Seg'; if(w == 2) q = 'Ter';
                if(w == 3) q = 'Qua'; if(w == 4) q = 'Qui'; if(w == 5) q = 'Sex';
                if(w == 6) q = 'Sab';
            let u = m = parseInt(d.getMonth()+1);
                if(m == 1) m = 'Jan'; if(m == 2) m = 'Fev'; if(m == 3) m = 'Mar';
                if(m == 4) m = 'Abr'; if(m == 5) m = 'Mai'; if(m == 6) m = 'Jun';
                if(m == 7) m = 'Jul'; if(m == 8) m = 'Ago'; if(m == 9) m = 'Set';
                if(m == 10) m = 'Out'; if(m == 11) m = 'Nov'; if(m == 12) m = 'Dez';
            let h = parseInt(d.getHours());
                if(h <= 23) p = 'Noite';
                if(h <= 18) p = 'Tarde';
                if(h <= 11) p = 'Manh&atilde;';
                if(h <= 5) p = 'Madrug.';
                if(h == 0) p = 'Noite';

        if(String(lang) == 'en'){
            let w = parseInt(d.getDay());
                if(w == 0) q = 'Sun'; if(w == 1) q = 'Mon'; if(w == 2) q = 'Tue';
                if(w == 3) q = 'Wed'; if(w == 4) q = 'Thu'; if(w == 5) q = 'Fri';
                if(w == 6) q = 'Sat';
            let u = m = parseInt(d.getMonth()+1);
                if(m == 1) m = 'Jan'; if(m == 2) m = 'Feb'; if(m == 3) m = 'Mar';
                if(m == 4) m = 'Apr'; if(m == 5) m = 'May'; if(m == 6) m = 'Jun';
                if(m == 7) m = 'Jul'; if(m == 8) m = 'Aug'; if(m == 9) m = 'Sep';
                if(m == 10) m = 'Oct'; if(m == 11) m = 'Nov'; if(m == 12) m = 'Dec';
            let h = parseInt(d.getHours());
                if(h <= 23) p = 'Night';
                if(h <= 18) p = 'Afternoon';
                if(h <= 11) p = 'Morning';
                if(h <= 5) p = 'Night';
                if(h == 0) p = 'Night';
        }
        let s = "";
        for(var i=0;i<stringtxt.length;i++) {
          if(stringtxt.charAt(i) == 'Y') s += d.getFullYear();
          else if(stringtxt.charAt(i) == 'y') s += String("0"+d.getFullYear()).substr(-2);
          else if(stringtxt.charAt(i) == 'm') s += String("0"+u).substr(-2);
          else if(stringtxt.charAt(i) == 'd') s += String("0"+d.getDate()).substr(-2);
          else if(stringtxt.charAt(i) == 'H') s += String("0"+h).substr(-2);
          else if(stringtxt.charAt(i) == 'i') s += String("0"+d.getMinutes()).substr(-2);
          else if(stringtxt.charAt(i) == 's') s += String("0"+d.getSeconds()).substr(-2);
          else if(stringtxt.charAt(i) == 'P') s += p;
          else if(stringtxt.charAt(i) == 'w') s += w;
          else if(stringtxt.charAt(i) == 'D') s += q;
          else if(stringtxt.charAt(i) == 'M') s += m;
          else s += stringtxt.charAt(i); }
        return s;
    }

    function converttimesstamp() {      
        var times = $('#timesstamp').val();   
        $('.alert').html('');
        if(String(times).replace('undefined','').replace('null','') == '') {
            $('#timesstamp').focus();
            $('.alert').text('Coloque um valor'); 
            return;             
        }
        var horas = "";        
        var form = "d-m-Y";       
        if($('#form').is(':checked')) form = "Y-m-d";      
        if($('#horas').is(':checked')) horas = "H:i:s"; 
        if($('#op').is(':checked')) form = $('#timesstampmanual').val();  
        var lang = $('#lang').val();
        document.getElementById("result").innerHTML = date(`${form} ${horas}`,times,lang);
    }

    function convertdatetimesstamp() {      
        var times = $('#datasdate').val();   
        $('.alert2').html('');
        if(String(times).replace('undefined','').replace('null','') == '') {
            $('#datasdate').focus();
            $('.alert2').text('Coloque uma data'); 
            return;             
        }
        data = new Date(times);   
        document.getElementById("result2").innerHTML = data.getTime() / 1000;
    }

    function opmanual(){      
        $('#form').prop('checked',false);     
        if($('#op').is(':checked')){
            $('#form').attr('disabled',true);
            return $('#timesstampmanual').show();
        }
        $('#form').attr('disabled',false);
        $('#timesstampmanual').hide();  
    }
    
}());


