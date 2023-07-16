<?php
include("../partials/conditions.php");
include("../partials/connect.php");
if (isset($_SESSION['username'])) {

    if ($_SESSION["role"] != "admin") {
        header("Location: /housingadda/index.php");
    }
}

?>



<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport">

    <title>Profile</title>
    <meta content="" name="description">
    <meta content="" name="keywords">

    <!-- Favicons -->
    <link href="assets/img/favicon.png" rel="icon">
    <link href="assets/img/apple-touch-icon.png" rel="apple-touch-icon">

    <!-- Google Fonts -->
    <link href="https://fonts.gstatic.com" rel="preconnect">
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i|Nunito:300,300i,400,400i,600,600i,700,700i|Poppins:300,300i,400,400i,500,500i,600,600i,700,700i" rel="stylesheet">

    <!-- Vendor CSS Files -->
    <link href="assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link href="assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
    <link href="assets/vendor/boxicons/css/boxicons.min.css" rel="stylesheet">
    <link href="assets/vendor/quill/quill.snow.css" rel="stylesheet">
    <link href="assets/vendor/quill/quill.bubble.css" rel="stylesheet">
    <link href="assets/vendor/remixicon/remixicon.css" rel="stylesheet">
    <link href="//cdn.datatables.net/1.10.23/css/jquery.dataTables.min.css" rel="stylesheet"/>

    <!-- Template Main CSS File -->
    <link href="assets/css/style.css" rel="stylesheet">


    <style>
        .status-btn {
            border: none;
            color: white;
            padding: 5px 10px;
            width: 70%;
            cursor: pointer;
            box-shadow: 0px 0px 15px gray
        }

        .approve {
            background-color: green;
        }

        .disapprove {
            background-color: red;
        }
    </style>




</head>

<body>

    <?php
    include("./header.php");
    include("./navbar.php");
    ?>

    <main id="main" class="main">

        <div class="pagetitle">
            <h1>User Approval</h1>
            <nav>
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                    <li class="breadcrumb-item active">User Approval</li>
                </ol>
            </nav>
        </div><!-- End Page Title -->

        <section class="section profile">
            <div class="row">

                <div class="col-xl-12 col-md-12">

                    <div class>
                        <div class>

                            <table class="table col-md-12 col-xs-3" id="tblUser">
                                <thead>

                                    <tr>
                                        <th>Customer Name</th>
                                        <th>Phone No.</th>
                                        <th>Status</th>
                                        <th>Approval?</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    <?php
                                    $users_all = "select * from customers c JOIN cust_info ci on c.username=ci.username where role!='admin'";
                                    $res_user = mysqli_query($conn, $users_all);

                                    while ($res = $res_user->fetch_assoc()) {
                                        // echo var_dump($res_user);
                                    ?>

                                        <tr>
                                            <td><?php echo $res['name']; ?></td>
                                            <td><a href="tel:<?php echo $res['username']; ?>"><?php echo $res['username']; ?></a></td>

                                            <td class="<?php echo $res['username']; ?>"><?php echo $res['status'] == 'yes' ? 'Approved' : 'Disapproved'; ?> </td>
                                            <td><button type="submit" style="width=70% !important;" id="<?php echo $res['username']; ?>" class="status-btn <?php echo $res['status'] == 'yes' ? 'approve' : 'disapprove'; ?>">
                                                    <?php
                                                    echo "Change Status";
                                                    ?>
                                                </button></td>

                                    </tr>

                                        <?php } ?>
                                </tbody>

                            </table>
                            <!-- ============displaying data with approval button========== -->

                            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
                            <script src="//cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js"></script>

                            <script>
                                $(document).ready(function() {
                                    $('#tblUser').DataTable(
                                        {
                                            searching:false
                                        }
                                    );


                                    $('.status-btn').on("click ", function() {
                                        var username = $(this).attr('id');

                                        console.log($(this));

                                        $.ajax({
                                            type: "POST",
                                            url: "./update_status.php",
                                            data: {
                                                updateId: username
                                            },
                                            dataType: "html",
                                            success: function(data) {


                                                if (data == 'no') {

                                                    $("." + username).html("Disapproved");

                                                } else if (data == 'yes') {

                                                    $("." + username).html("Approved");

                                                }
                                                if ($("#" + username).hasClass("approve")) {
                                                    // console.log("1")
                                                    $("#" + username).addClass("disapprove");
                                                    $("#" + username).removeClass("approve");
                                                } else if ($("#" + username).hasClass("disapprove")) {
                                                    // console.log("2")
                                                    $("#" + username).addClass("approve");
                                                    $("#" + username).removeClass("disapprove");
                                                }

                                            }
                                        });

                                    });
                                });
                            </script>

                        </div>
                    </div>

                </div>
            </div>
        </section>

    </main><!-- End #main -->

    <!-- ======= Footer ======= -->
    <footer id="footer" class="footer">
        <div class="credits">
            Designed by <a href="#">JVSH Technologies</a>
        </div>
    </footer><!-- End Footer -->

    <a href="#" class="back-to-top d-flex align-items-center justify-content-center"><i class="bi bi-arrow-up-short"></i></a>

    <!-- Vendor JS Files -->
    <script src="assets/vendor/apexcharts/apexcharts.min.js"></script>
    <script src="assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="assets/vendor/chart.js/chart.umd.js"></script>
    <script src="assets/vendor/echarts/echarts.min.js"></script>
    <script src="assets/vendor/quill/quill.min.js"></script>
    <script src="assets/vendor/simple-datatables/simple-datatables.js"></script>
    <script src="assets/vendor/tinymce/tinymce.min.js"></script>
    <script src="assets/vendor/php-email-form/validate.js"></script>

    <!-- Template Main JS File -->
    <script src="assets/js/main.js"></script>

</body>

</html>