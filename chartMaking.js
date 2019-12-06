window.onload = function() {
    

    
    
    function makeChart(destination, labels, data, title){

        var chart = document.getElementById("barChart").getContext('2d');
        
        var myChart = new Chart(chart, {
            type: 'bar',
            data: {
                labels: [labels[0], labels[1], labels[2], labels[3]],
                datasets: [{
                    label: 'Getting the Dets',
                    data: [data[0], data[1], data[2], data[3]],
                    backgroundColor: ['#F9557B', '#FA9F6B', '#579D9C'],
                    borderColor: ['#FFF'],
                    borderWidth: 1
                }]
            },
            options: {
                title: {
                    display: true,
                    text: title
                },
                legend: {
                    position: "bottom"
                }
            }
        });
    }

    
}