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
            icon = isRevoked ? "&check;" : isRevoked === false ? "&cross;" : "&quest;"; //"&excl;";
            color = isRevoked ? "bg-danger" : isRevoked === false ? "bg-success" : "bg-warning";

            if (value === "null" || value === null) {
                value_ = "?"
            }
        }



        // append textContent="&check;" to li
        li.innerHTML = `<span class="badge ${color} rounded-pill" style="margin-right:16px;">${icon}</span>${key.replaceAll("_", " ")}&nbsp;<b>${value_}</b>`;


        // Append the newly created li to the ul element
        ul.appendChild(li);
    }

    //get now element ul with id="earningCriteriaList" and add a li element with text content "ciao"

    earningCriteriaList = document.getElementById("earningCriteriaList");
    const li2 = document.createElement('li');

    if (certInfoObj.revoked === true){
        return
    }
    if (certInfoObj.role === "partecipant") {
        li2.innerHTML = "<b>Attendance</b>: &ge;80%"
    } else if (certInfoObj.role === "volunteer") {
        li2.innerHTML = `<b>Volunteering</b>: In recognition of your exceptional dedication to sharing your skills and your enthusiasm and passion within our community.<br><br>

        Your contributions have enhanced our projects and inspired your peers—demonstrating how individual talents can catalyze collective progress.<br><br>

        For all the time you've invested and the expertise you've imparted, we extend our deepest thanks. Your actions have affirmed that through passionate giving, we all grow stronger together.`
    } else if (certInfoObj.role === "collaborator") {
        li2.innerHTML = `<b>Collaboration</b>: In recognition of your exceptional collaborative spirit and efforts.<br><br>
        
        Your active participation, shared responsibility in our projects, deep investment in our shared goals, proactive contributions to decision-making, had a significant impact on project outcomes and they have been invaluable.<br><br>
        
        Thank you for making a difference with your passion and drive. Your work has not only furthered our objectives but also enriched the experience of all involved.`
    } else if (certInfoObj.role === "speaker") {
        li2.innerHTML = `<b>Scientific contribution</b>: In recognition of your contribution as a speaker at our event. Your expertise and insights have significantly enriched the knowledge and experience of all who attended.<br><br>

        Your dedication to engaging with the audience and sharing your knowledge was evident and much appreciated. Your ability to connect with participants, address their questions, and stimulate thoughtful discussion contributed immeasurably to the success of our gathering.<br><br>

        Thank you once again for your inspiring presence and for adding such remarkable value to our endeavors.
        `
    } else if (certInfoObj.role === "organizer") {
        li2.innerHTML = `<b>Organization</b>: In recognition of your contribution as a organizer at our event. Your incredible dedication and monumental effort have contributed to the success of our event.<br><br>
        
        Your organizational and communication skills, your unwavering commitment, collaborative spiritm, creativity and passion have ensured that every aspect of the event was executed flawlessly.<br><br>

        Thank you for your invaluable contribution and for making a difference with your passion and drive.
    `
    }

    earningCriteriaList.appendChild(li2);

}