<?php
include("../partials/conditions.php");
include("../partials/connect.php");

if ($_SESSION["role"] != "admin") {
    header("Location: /housingadda/index.php");
}

?>



<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport">

    <title>Contact Us</title>
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
    <link href="assets/vendor/simple-datatables/style.css" rel="stylesheet">
    <link href="//cdn.datatables.net/1.10.23/css/jquery.dataTables.min.css" rel="stylesheet"/>
    <!-- Template Main CSS File -->
    <link href="assets/css/style.css" rel="stylesheet">


    <style>
        .status-btn {
            border: none;
            color: white;
            padding: 5px 10px;
            width: 100px;
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
            <h1>Contact us</h1>
            <nav>
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                    <li class="breadcrumb-item active">Contact Us- Data</li>
                </ol>
            </nav>
        </div><!-- End Page Title -->

        <section class="section profile">
            <div class="row">

                <div class="col-xl-12 col-md-12">

                    <div class="card">
                        <div class="card-body pt-3">

                            <table class="table col-md-12 col-xs-3" id="tblUser">
                                <thead>

                                    <tr>
                                        <th>Name</th>
                                        <th>Phone No.</th>
                                        <th>Email</th>
                                        <th>Message</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    <?php
                                    $contact = "select * from contact_us";
                                    $res_contact = mysqli_query($conn, $contact);
                                    if ($res_contact) {

                                        while ($res = $res_contact->fetch_assoc()) {


                                    ?>
                                            <tr>
                                                <td><?php echo $res['name']; ?></td>
                                                <td><?php echo $res['phone']; ?></td>
                                                <td><?php echo $res['email']; ?></td>
                                                <td><?php echo $res['message']; ?></td>
                                                <td></td>

                                            <tr>;

                                            <?php } ?>

                            </table>
                        <?php } else {
                                        echo "no queries to show";
                                    } ?>
                        </tbody>
                        <!-- ============displaying data with approval button========== -->


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

    <script src="//cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js"></script>

    <script>
        $(document).ready(function() {
            $('#tblUser').DataTable({
                searching: false
            });
        });
    </script>

</body>

</html>