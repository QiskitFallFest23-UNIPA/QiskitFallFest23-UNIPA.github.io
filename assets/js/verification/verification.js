// Fetch the public key from a static file
async function fetchPublicKey(keyPath='/assets/keys/public_key.pem') {
    try {
        const response = await fetch(keyPath).then((response) => {
            if (response.ok) {
                return response;
            } else {
                throw new Error('Error fetching public key:', response.statusText);
            }
        });
        
        // Replace with the actual path to your public key file
        const publicKey = await response.text();
        return publicKey;
    } catch (error) {
        console.error('Error fetching public key:', error);
        return null;
    }

}

// Function to extract query parameters from the URL
function getQueryParams(url) {
    const params = {};
    const urlSearchParams = new URLSearchParams(url.slice(url.indexOf('?') + 1));
    for (const [key, value] of urlSearchParams) {
        params[key] = value;
    }
    return params;
}

// Extract certificate ID and signature from the URL
function getCertificateInfo(window) {
    // Get the query string from the URL
    const queryString = window.location.search;

    if (queryString === '') {
        console.warn('Query string not found in the URL.');
        return null;
    }

    // Parse the query string into an object
    const urlParams = new URLSearchParams(queryString);

    const response = {};
    for (const [key, value] of urlParams) {

        if (key === 'id' || key === 'signature') {

            // replace - with + and _ with / in the URL
            // (the string was generated using base64urlsafe encoding)
            const encodedString = value.replace(/-/g, '+').replace(/_/g, '/');

            // from base64 string to string
            try {
                response[key] = atob(encodedString);
            } catch (error) {
                console.warn('Error decoding base64 string:', error);
                response[key] = null;
            }

        } else {
            response[key] = value;
        }

    }

    if (!response.id) {
        console.warn('Certificate ID not found in the URL.');
    } else {
        console.debug('Certificate ID:', response.id);
    }

    if (!response.signature) {
        console.warn('Signature not available.');
    } else {
        console.debug('Signature found in the URL.');
    }

    return response;
}

/*
Convert a string into an ArrayBuffer
from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
*/
function str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}


function importRsaKey(pem) {
    // fetch the part of the PEM string between header and footer
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = pem.substring(
        pemHeader.length,
        pem.length - pemFooter.length - 1,
    );
    // base64 decode the string to get the binary data
    const binaryDerString = window.atob(pemContents);
    // convert from a binary string to an ArrayBuffer
    const binaryDer = str2ab(binaryDerString);

    // is window.crypto.subtle not defined?
    if (window?.crypto?.subtle === undefined) {
        console.error("WebCrypto API not available in this browser! Are you using HTTPS?");
        throw new Error("WebCrypto API not available in this browser! Are you using HTTPS?");
    }

    return window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        {
            name: "RSASSA-PKCS1-v1_5",
            hash: "SHA-256",
        },
        true,
        ["verify"],
    );
}

// Function to verify the signature
async function verifySignature_1(data, signature, publicKey) {


    // Create a CryptoKey object from the public key
    const cryptoKey = await importRsaKey(publicKey);

    // Verify the signature using the retrieved certificate data and publicKey
    // If the signature is valid, return true; otherwise, return false
    const signatureBytes = Uint8Array.from(signature, c => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify(
        { name: 'RSASSA-PKCS1-v1_5' },
        cryptoKey,
        signatureBytes,
        new TextEncoder().encode(data)
    );

    return isValid;
}


// Function to verify the signature using the public key
async function verifySignature_2(data, signature, publicKey) {

    // Create a CryptoKey object from the public key
    const cryptoKey = await importPrivateKey(publicKey);

    // Compute the SHA-256 hash of the data
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

    // Verify the signature
    const signatureBuffer = new Uint8Array(signature.match(/[\s\S]/g).map((ch) => ch.charCodeAt(0)));

    const isValid = await crypto.subtle.verify(
        { name: 'RSA-PSS', saltLength: 20 },
        cryptoKey,
        signatureBuffer,
        hashBuffer
    );

    return isValid;
}


// Verify the certificate using the public key and signature
async function verifyCertificate(certInfo) {
    const publicKey = await fetchPublicKey();
    const certId = certInfo.id;
    const signature = certInfo.signature;
    let exception = null;

    if (!certId) {
        console.warn("Certificate not verifiable!")
        return {
            isValid: null,
            error: "Certificate not available."
        }
    }

    if (!signature) {
        console.warn("Certificate not verifiable!")
        return {
            isValid: null,
            error: "Signature not available."
        };
    };

    if (!publicKey) {
        console.warn("Certificate not verifiable!");
        return {
            isValid: null,
            error: "Public Key not available."
        };
    }

    // Verify the signature
    const isValid = await verifySignature_1(certId, signature, publicKey).then((result) => {
        console.log('Certificate verification Result:', result);

        if (result === true) {
            // Display success message
            console.log("Certificate is valid!");
        } else {
            // Display error message
            console.warn("Certificate is not valid!");
        }
        return result;
    }).catch((error) => {

        console.warn(`Error verifying certificate: ${error}`);
        exception = error;
        return null;
    });

    return {
        isValid: isValid,
        error: exception
    };
}