// Perform verification when the page loads
//document.addEventListener("DOMContentLoaded", function () {    });

window.onload = async function () {

    // Get the certificate info from the URL
    const certInfo = getCertificateInfo(window);

    let resultMessage = ""
    let isValid = null;

    if (certInfo === null) {
        console.warn('Certificate Info not found in the URL.');

        // Display the verification result
        resultMessage = 'Do you want to verify a certificate?<br>From the .pdf certificate you received, click on the link <code>Verify here</code> or scan the QR code.';
    } else {
        let certInfoObj = JSON.parse(certInfo.cert); //from jsonstring to object
        //const certInfoStr = JSON.stringify(certInfoObj); //from object to string

        // Perform verification when the page loads
        const response = await verifyCertificate(certInfo);
        isValid = response.isValid;
        certInfoObj.revoked = response.isRevoked;
        console.debug("response:", response);

        // Display the verification result
        resultMessage = isValid ? `This certificate is valid and it was issued to <b>${certInfoObj.issued_to}</b> on <b>${certInfoObj.issued_on}</b>.` : isValid === false ? `Sorry, but this certificate is not valid!<br>Details: <code>${response.error}</code>` : `Sorry, but an unexpected error occurred while verifying the certificate! Please contact the issuer of this certificate for more information.<br>Details: <code>${response.error}</code>`;

        //certificateDetails
        showCertificateDetails(certInfoObj, response, 'certificateDetails');

        //certificate_details_title
        hideElement('certificate_details_title', false);
    }

    // verificationResult callout 
    createAlertElement('verificationResult', 'bd-callout', isValid, resultMessage);

    //earningCriteria
    hideElement('earningCriteria', isValid !== true);

};


function createAlertElement(elementId, classPrefix, isValid, resultMessage) {
    document.getElementById(elementId).innerHTML = resultMessage;
    if (isValid !== null) {
        document.getElementById(elementId).classList.add(classPrefix, `${classPrefix}-${isValid ? 'success' : 'danger'}`);
        document.getElementById(elementId).classList.remove(`${classPrefix}-${isValid ? 'danger' : 'success'}`);
    } else {
        document.getElementById(elementId).classList.add(classPrefix, `${classPrefix}-warning`);
    }
}

function hideElement(elementId, wantToHide = true) {
    let element = document.getElementById(elementId);
    const display_style = window.getComputedStyle(element).display;
    const has_hidden_attribute = element.hasAttribute('hidden');

    if (!element) {
        return;
    }

    if (wantToHide === true) {
        if (!has_hidden_attribute) {
            element.setAttribute('hidden', "");
        }
        if (display_style !== 'none') {
            element.style.display = 'none';
        }

    } else {
        if (has_hidden_attribute) {
            element.removeAttribute('hidden');
        }
        if (display_style === 'none') {
            element.style.display = 'block';
        }

    }

}


function showCertificateDetails(certInfoObj, response, elementId = 'certificateDetails') {

    const isValid = response.isValid;
    const isRevoked = response.isRevoked;
    const isSigned = response.isSigned;

    // for each key-value pair in certInfoObj
    // create a li element with key as id and value as textContent
    // append li element to ul element

    // Get the ul element where we want to append the list items
    const ul = document.getElementById(elementId);

    hideElement(elementId, wantToHide = false);

    //add the list item to the ul element --------------------

    // Create a new li element
    const li = document.createElement('li');

    // Add the classes to the li element
    li.classList.add('list-group-item', isValid ? 'list-group-item-success' : isValid === false ? 'list-group-item-danger' : 'list-group-item-warning',);

    // Set the id of li to the key from certInfoObj
    //li.id = key;

    // append textContent="&check;" to li
    li.textContent = `${isValid ? "Valid" : isValid === false ? "Invalid" : "Unverifiable"} certificate`;

    // Append the newly created li to the ul element
    ul.appendChild(li);

    //---------------------------

    // Iterate over each entry in the object
    for (const [key, value] of Object.entries(certInfoObj)) {

        let value_ = value

        // Create a new li element
        const li = document.createElement('li');

        // Add the classes to the li element
        li.classList.add('list-group-item', 'd-flex', 'align-items-center', /*'justify-content-between', */);

        // Set the id of li to the key from certInfoObj
        li.id = key;

        /*
        // Set the text content of li to the corresponding value from certInfoObj
        li.textContent = `${key}: ${value}`;

        //append a span element with class="badge bg-success rounded-pill" and textContent="&check;" to li
        /*const span = document.createElement('span');
        span.classList.add('badge', 'bg-success', 'rounded-pill');
        span.innerHTML = '&check;';
        li.appendChild(span);
        */
        let icon = null
        let color = null
        if (key !== "revoked") {
            icon = isValid ? "&check;" : isValid === false ? "&cross;" : "&excl;";
            color = isValid ? "bg-success" : isValid === false ? "bg-danger" : "bg-warning"
        } else {
            // key === "revoked"
            icon = isRevoked? "&check;" : isRevoked===false ?"&cross;" :"&quest;"; //"&excl;";
            color = isRevoked? "bg-danger" : isRevoked===false ? "bg-success" : "bg-warning";

            if (value==="null"||value===null){
                value_="?"
            }
        }



        // append textContent="&check;" to li
        li.innerHTML = `<span class="badge ${color} rounded-pill" style="margin-right:16px;">${icon}</span>${key.replaceAll("_", " ")}&nbsp;<b>${value_}</b>`;


        // Append the newly created li to the ul element
        ul.appendChild(li);
    }
}