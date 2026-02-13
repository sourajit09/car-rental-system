import React from 'react'

const Contact = () => {
  return (
    <>
    <div className="d-flex flex-column align-items-center justify-content-center" style={{minHeight:'80vh'}}>
      <img src="https://imgs.search.brave.com/CzaWmbSTc1XvQqKBxWgXFB9qeErZXZ3TcvDmAxdS3uo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWcu/aWNvbnM4LmNvbS9l/eHRlcm5hbC1zbWFz/aGluZ3N0b2Nrcy1m/bGF0LXNtYXNoaW5n/LXN0b2Nrcy8xMjAw/L2V4dGVybmFsLUhl/bHBsaW5lLW9mZmlj/ZS1zbWFzaGluZ3N0/b2Nrcy1mbGF0LXNt/YXNoaW5nLXN0b2Nr/cy5qcGc"  
     alt="help"
     height={300} 
     width={300}
      />
      <h2>For Any Assistance</h2>
      <h2 className="mt-3 text-success">
        <i className="fa-solid fa-phone-volume"></i>1234567890
      </h2>
       <h2 className='mt-3'>
        <i className="fa-solid fa-envelope"></i>help@carrentalapp.com
      </h2>
    </div>
    </>
  )
}

export default Contact
