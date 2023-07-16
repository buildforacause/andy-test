<?php
 include("../partials/conditions.php");
 include("../partials/connect.php");


 if(isset($_POST['updateId'])){
    $updateId = $_POST['updateId'];

    $get_status="select * from customers where username=$updateId";

    $res = mysqli_query($conn,$get_status);
    
    if(mysqli_num_rows($res) > 0 ){
        while($r= $res->fetch_assoc()){
            if($r['status'] == 'yes'){
                $u_status="update customers set status='no' where username=$updateId";
                $u_res = mysqli_query($conn,$u_status);
                echo 'no';
            }
            elseif($r['status'] == 'no'){
                $u_status="update customers set status='yes' where username=$updateId";
                $u_res = mysqli_query($conn,$u_status);
                echo 'yes';
            }
            else{
                echo "something went wrong";
            }

        }
    }else{
        echo 'No Customers to Display';
    }



 }
?>