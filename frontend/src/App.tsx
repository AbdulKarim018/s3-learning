import { useState } from "react";

function App() {
  const [file, setFile] = useState<File>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      console.log("No file selected");
      alert("No file selected");
      return;
    }
    const url = `http://localhost:3000/getpresignedurl`;

    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        key: file.name,
        type: file.type,
        expires: 60,
      }),
    });
    const { url: uploadUrl } = await res.json();
    console.log(uploadUrl);
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
    });
    console.log("Uploaded");
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0])} />
        <button type="submit" value="Upload" className="btn btn-primary">
          Submit
        </button>
      </form>
      <button
        onClick={async () => {
          const res = await fetch("http://localhost:3000/delete", {
            method: "DELETE",
            body: JSON.stringify({
              key: file?.name,
            }),
          });
          const { result } = await res.json();
          console.log(result);
        }}
        className="btn btn-error"
      >
        Delete
      </button>
    </div>
  );
}

export default App;
