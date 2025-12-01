
export default function Footer () {
    return (
        <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} NoHLAG Exams. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    )
}