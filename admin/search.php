<?php
include("../partials/connect.php");

include("../partials/conditions.php");

$phone = "";
$name = "";
$loc = "";
$err = "";
if (isset($_SESSION['username'])) {
    if ($_SESSION['role'] != "admin") {

        echo '<script> alert("Access Denied!!!") </script>';
        header("Location: /housingadda/logout.php?logout=true");
    }
}


if (isset($_POST['person'])) {
    $person = $_POST['person'];

    $search = "select * from cust_info where username='$person'";
    $res = mysqli_query($conn, $search);


    if ($res) {


        while ($r = $res->fetch_assoc()) {
            if (count($r) <= 0) {
                $err = "No user Found";
            } else {

                $phone = $r['username'];
                $name = $r['name'];
                $loc = $r['location'];
            }
        }
    } else {
        $err = "Something Went Wrong";
    }
}


?>


<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport">

    <title>Search Customers</title>
    <meta content="" name="description">
    <meta content="" name="keywords">

    <!-- Favicons -->
    <link href="assets/img/favicon.png" rel="icon">
    <link href="assets/img/apple-touch-icon.png" rel="apple-touch-icon">

    <!-- Google Fonts -->
    <link href="https://fonts.gstatic.com" rel="preconnect">
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i|Nunito:300,300i,400,400i,600,600i,700,700i|Poppins:300,300i,400,400i,500,500i,600,600i,700,700i" rel="stylesheet">

    <!-- Vendor CSS Files -->

    <link href="//cdn.datatables.net/1.13.4/css/jquery.dataTables.min.css" rel="stylesheet">
    <link href="assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link href="assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link href="assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
    <link href="assets/vendor/boxicons/css/boxicons.min.css" rel="stylesheet">
    <link href="assets/vendor/quill/quill.snow.css" rel="stylesheet">
    <link href="assets/vendor/quill/quill.bubble.css" rel="stylesheet">
    <link href="assets/vendor/remixicon/remixicon.css" rel="stylesheet">
    <link href="assets/vendor/simple-datatables/style.css" rel="stylesheet">

    <!-- Template Main CSS File -->
    <link href="assets/css/style.css" rel="stylesheet">

</head>

<body>

    <?php
    include("./header.php");
    include("./navbar.php");
    ?>

    <main id="main" class="main">

        <div class="pagetitle">
            <h1>Search Customer</h1>
            <nav>
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                    <li class="breadcrumb-item active">Search</li>
                </ol>
            </nav>
        </div><!-- End Page Title -->

        <section class="section profile">
            <div class="row">

                <div class="col-xl-12">

                    <div class="card">
                        <div class="card-body pt-3">
                            <!-- Bordered Tabs -->
                            <ul class="nav nav-tabs nav-tabs-bordered">

                                <li class="nav-item">
                                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#profile-change-password">Search Person</button>
                                </li>

                            </ul>
                            <div class="tab-content pt-2">
                                <div class="tab-pane fade show active pt-3" id="profile-change-password">
                                    <!-- Change Password Form -->
                                    <form method="POST">

                                        <div class="row mb-3">
                                            <label for="currentPassword" class="col-md-4 col-lg-3 col-form-label">Phone No</label>
                                            <div class="col-md-8 col-lg-9">
                                                <input name="person" type="number" class="form-control" id="currentPassword">
                                            </div>
                                        </div>

                                        <div class="text-center">
                                            <button type="submit" class="btn btn-primary">Search</button>
                                        </div>
                                    </form><!-- End Change Password Form -->

                                </div>

                            </div><!-- End Bordered Tabs -->

                            <?php

                            echo $err;

                            ?>
                            Phone No: <a href="tel:<?php echo $phone; ?>"><?php echo $phone; ?></a><br>
                            Name: <label class="fw-bold"><?php echo $name; ?></label><br>
                            Location: <label class="fw-bold"><?php echo $loc; ?></label><br>
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
    <script src="//cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js    "></script>

</body>

</html>