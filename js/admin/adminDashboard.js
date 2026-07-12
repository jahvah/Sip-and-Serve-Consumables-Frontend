Chart.register(ChartDataLabels);

$(document).ready(function () {
    loadSummary();
    loadBarChart();
    loadLineChart();
    loadPieChart();
});

const options = {

    weekday: "long",

    year: "numeric",

    month: "long",

    day: "numeric"

};

$("#todayDate").text(

    new Date().toLocaleDateString(

        "en-US",

        options

    )

);

function loadSummary(){

    $.get("http://localhost:3000/api/dashboard/summary", function(data){

        $("#totalUsers").text(data.totalUsers);

        $("#totalItems").text(data.totalItems);

        $("#totalOrders").text(data.totalOrders);

        $("#totalSales").text(
            "₱" + Number(data.totalSales).toLocaleString(undefined,{
                minimumFractionDigits:2,
                maximumFractionDigits:2
            })
        );

    });

}

// ==========================
// BAR CHART
// Available Items per Category
// ==========================
function loadBarChart() {

    $.get("http://localhost:3000/api/dashboard/items-category", function (response) {

        const labels = response.rows.map(r => r.category);
        const totals = response.rows.map(r => Number(r.total));

        new Chart(document.getElementById("barChart"), {

            type: "bar",

            data: {

                labels: labels,

                datasets: [{

                    label: "Items",

                    data: totals,

                    backgroundColor: "#4e73df",
                    

                }]

            },

            options: {

                responsive: true,
                maintainAspectRatio: false,

                animation: {
                    duration: 1500
                },

                scales: {
                    y: {
                        beginAtZero: true
                    }
                },

                plugins: {

                    legend: {
                        display: false
                    },

                    title: {
                        display: true,
                        text: "Available Items per Category",
                        font: {
                            size: 18
                        },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    },

                    datalabels: {

                        anchor: "end",

                        align: "end",

                        offset: -5,

                        color: "#000",

                        font: {
                            weight: "bold",
                            size: 12
                        },

                        formatter: function (value) {
                            return value;
                        }

                    }

                }

            }

        });

    });

}

// ==========================
// LINE CHART
// Orders Received Per Month
// ==========================
function loadLineChart() {

    $.get("http://localhost:3000/api/dashboard/orders-month", function (response) {

        const labels = response.rows.map(r => r.month);
        const totals = response.rows.map(r => Number(r.total));

        new Chart(document.getElementById("lineChart"), {

            type: "line",

            data: {

                labels: labels,

                datasets: [{

                    label: "Orders",

                    data: totals,

                    fill: false,

                    borderColor: "#1cc88a",

                    backgroundColor: "#1cc88a",

                    pointBackgroundColor: "#1cc88a",

                    pointBorderColor: "#ffffff",

                    pointRadius: 5,

                    pointHoverRadius: 7,

                    borderWidth: 3,

                    tension: 0.3

                }]

            },

            options: {

                responsive: true,
                maintainAspectRatio: false,

                animation: {
                    duration: 1500
                },

                scales: {
                    y: {
                        beginAtZero: true
                    }
                },

                plugins: {

                    legend: {
                        display: false
                    },

                    title: {
                        display: true,
                        text: "Orders Received Per Month",
                        font: {
                            size: 18
                        }
                    },

                    datalabels: {

                        anchor: "end",

                        align: "top",

                        color: "#000",

                        font: {
                            weight: "bold",
                            size: 12
                        },

                        formatter: function (value) {
                            return value;
                        }

                    }

                }

            }

        });

    });

}

// ==========================
// PIE CHART
// Order Status Distribution
// ==========================
function loadPieChart() {

    $.get("http://localhost:3000/api/dashboard/order-status", function (response) {

        const labels = response.rows.map(r => r.status);
        const totals = response.rows.map(r => Number(r.total));

        new Chart(document.getElementById("pieChart"), {

            type: "pie",

            data: {

                labels: labels,

                datasets: [{

                    data: totals,

                    backgroundColor: [
                        "#4e73df",
                        "#1cc88a",
                        "#f6c23e",
                        "#e74a3b"
                    ],

                    borderColor: "#ffffff",

                    borderWidth: 2

                }]

            },

            options: {

                responsive: true,
                maintainAspectRatio: false,

                animation: {
                    duration: 1500
                },

                plugins: {

                    title: {
                        display: true,
                        text: "Order Status Distribution",
                        font: {
                            size: 18
                        }
                    },

                    legend: {
                        position: "bottom"
                    },

                    datalabels: {

                        color: "#ffffff",

                        font: {
                            weight: "bold",
                            size: 12
                        },

                        formatter: function (value, context) {

                            return (
                                context.chart.data.labels[context.dataIndex] +
                                "\n" +
                                value
                            );

                        }

                    }

                }

            }

        });

    });

}