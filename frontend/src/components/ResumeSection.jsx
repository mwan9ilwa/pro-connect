import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { FileUp, Download, Calendar, FileX, Loader } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

const ResumeSection = ({ userData, isOwnProfile, onSave }) => {
	const [isUploading, setIsUploading] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);
	const queryClient = useQueryClient();

	const { mutate: deleteResume, isPending: isDeleting } = useMutation({
		mutationFn: async () => {
			await axiosInstance.put("/users/profile", { resume: null });
		},
		onSuccess: () => {
			toast.success("Resume deleted successfully");
			queryClient.invalidateQueries(["userProfile", userData.username]);
			queryClient.invalidateQueries(["authUser"]);
		},
		onError: (err) => {
			toast.error(err.response?.data?.message || "Failed to delete resume");
		},
	});

	const handleFileChange = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		// Validate file type - accept only PDF and common document formats
		const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
		if (!validTypes.includes(file.type)) {
			toast.error("Please upload a PDF or Word document");
			return;
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast.error("File size should be less than 5MB");
			return;
		}

		try {
			setIsUploading(true);
			const reader = new FileReader();
			reader.onloadend = async () => {
				try {
					const resumeData = {
						resume: reader.result,
						resumeName: file.name
					};
					await onSave(resumeData);
					toast.success("Resume uploaded successfully");
				} catch (error) {
					console.error("Error uploading resume:", error);
					toast.error("Failed to upload resume");
				} finally {
					setIsUploading(false);
				}
			};
			reader.readAsDataURL(file);
		} catch (error) {
			console.error("Error reading file:", error);
			toast.error("Failed to process file");
			setIsUploading(false);
		}
	};

	const handleDeleteResume = () => {
		if (window.confirm("Are you sure you want to delete your resume?")) {
			deleteResume();
		}
	};

	const handleDownloadResume = async () => {
		if (!userData.resume?.url) return;
		
		setIsDownloading(true);
		try {
			// Fetch the file from Cloudinary URL
			const response = await fetch(userData.resume.url);
			const blob = await response.blob();
			
			// Create a download link
			const downloadUrl = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = downloadUrl;
			
			// Extract file extension from filename or default to .pdf
			const filename = userData.resume.filename;
			let extension = '.pdf';
			if (filename) {
				const parts = filename.split('.');
				if (parts.length > 1) {
					extension = `.${parts[parts.length - 1]}`;
				}
			}
			
			// Ensure filename has the correct extension
			const downloadFilename = filename.endsWith(extension) 
				? filename 
				: `${filename}${extension}`;
				
			a.download = downloadFilename;
			document.body.appendChild(a);
			a.click();
			
			// Clean up
			window.URL.revokeObjectURL(downloadUrl);
			document.body.removeChild(a);
		} catch (error) {
			console.error("Error downloading resume:", error);
			toast.error("Failed to download resume");
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<div className="bg-white shadow rounded-lg p-6 mb-6">
			<h2 className="text-xl font-semibold mb-4">Resume</h2>
			
			{userData.resume?.url ? (
				<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
					<div className="flex justify-between items-center">
						<div>
							<h3 className="font-semibold text-gray-800">{userData.resume.filename}</h3>
							<div className="flex items-center text-sm text-gray-500 mt-1">
								<Calendar size={14} className="mr-1" />
								<span>Uploaded {userData.resume.uploadDate ? formatDistanceToNow(new Date(userData.resume.uploadDate), { addSuffix: true }) : "recently"}</span>
							</div>
						</div>
						<div className="flex space-x-2">
							<button
								onClick={handleDownloadResume}
								disabled={isDownloading}
								className="p-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
								title="Download resume"
							>
								{isDownloading ? <Loader size={18} className="animate-spin" /> : <Download size={18} />}
							</button>
							{isOwnProfile && (
								<button
									onClick={handleDeleteResume}
									disabled={isDeleting}
									className="p-2 bg-red-500 text-white rounded-md hover:bg-red-700 transition-colors"
									title="Delete resume"
								>
									{isDeleting ? <Loader size={18} className="animate-spin" /> : <FileX size={18} />}
								</button>
							)}
						</div>
					</div>
				</div>
			) : (
				isOwnProfile && (
					<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
						<FileUp size={48} className="mx-auto text-gray-400 mb-3" />
						<p className="text-gray-600 mb-3">No resume uploaded yet</p>
						<label className="relative cursor-pointer">
							<input
								type="file"
								accept=".pdf,.doc,.docx"
								onChange={handleFileChange}
								className="hidden"
								disabled={isUploading}
							/>
							<span className="bg-primary hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors inline-block">
								{isUploading ? (
									<div className="flex items-center">
										<Loader size={16} className="animate-spin mr-2" />
										<span>Uploading...</span>
									</div>
								) : (
									"Upload Resume"
								)}
							</span>
						</label>
						<p className="text-xs text-gray-500 mt-2">Supported formats: PDF, DOC, DOCX (Max: 5MB)</p>
					</div>
				)
			)}

			{!userData.resume?.url && !isOwnProfile && (
				<p className="text-gray-500 italic">No resume available</p>
			)}
		</div>
	);
};

export default ResumeSection;