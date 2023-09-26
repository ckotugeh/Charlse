import React from react;





function laoanApplication(){
    var dropDown=document.getElementById('loanApplication'); //creating dropdown.
    var la= findLoanApplicationByName(dropDown.value);
    if(la !=undefined){
        var isEmployed=la.factor[0];
        var hasKids=la.factor[1];
        var hasLoan=la.factor[2];
        var hasCrediCard=la.factor[3];
//dorpdown list
        document.getElementById("inputName").value=la.ApplicantName;
        document.getElementById("inputDoBMonth").value=la.ApplicantDateOfBirthMonth;
        document.getElementById("inputDoBDay").value=la.ApplicantDateOfBirtDay;
        document.getElementById("inputDoBYear").value=la.ApplicantDateOfBirthYear;
        document.getElementById("inputAnnualIncome").value=la.ApplicantAnnualIcome;
        document.getElementById("inputAnnualIncome").value=la.ApplicantAnnualIncome;
        document.getElementById("isEmployed").check=isEmployed;
        document.getElementById("hasKids").check=hasKids;
        document.getElementById("hasLoan").check=hasLoan;
        document.getElementById("hasCreditCard").check=hasCreditCard;
        document.getElementById("inputLoanPurpose").value=la.ApplicantLoanPurpose;
        document.getElementById("inputLoanAmount").value=la.ApplicantLoanAmount;

    }

}