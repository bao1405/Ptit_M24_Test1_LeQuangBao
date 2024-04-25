
// import { v4 as uuidv4 } from "uuid";
class Feedback {
    private scoreActive: number;
    private listFeedbackLocal: { feedbackId: string, score: number, content: string }[];
    private feedbackInput: HTMLInputElement;
    private error: HTMLElement;
    private btnSend: HTMLElement;
    private reviewNumber: HTMLElement;
    private averageRate: HTMLElement;
    private inputContainer: HTMLElement;

    constructor() {
        this.scoreActive = 10;
        this.listFeedbackLocal = JSON.parse(localStorage.getItem("feedbacks")) || [];
        this.feedbackInput = document.querySelector("#feedbackInput") as HTMLInputElement;
        this.error = document.querySelector(".error") as HTMLElement;
        this.btnSend = document.querySelector(".btn-send") as HTMLElement;
        this.reviewNumber = document.querySelector(".review-number") as HTMLElement;
        this.averageRate = document.querySelector(".average-number") as HTMLElement;
        this.inputContainer = document.querySelector(".input-container") as HTMLElement;

        this.inputContainer.addEventListener("click", () => {
            this.feedbackInput.focus();
        });

        this.feedbackInput.focus();

        this.renderListButtonScore();
        this.handleScoreButtonClick();
        this.renderListFeedback();
        this.validateData();
        this.handleAverageRating();
        this.handleSendButtonClick();
    }


    private renderListButtonScore(): void {
        let scroses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let btnScoreGroup = document.querySelector(".btn-score-group") as HTMLElement;

        let scoreHtmls = scroses.map((score) => {
            return `
                <button class="btn-score ${score === this.scoreActive ? "active" : ""}" data-score="${score}">${score}</button>
            `;
        });

        let scroreHtml = scoreHtmls.join("");

        btnScoreGroup.innerHTML = scroreHtml;
    }

    private handleScoreButtonClick(): void {
        let btnScoreGroup = document.querySelector(".btn-score-group") as HTMLElement;

        btnScoreGroup.addEventListener("click", (e) => {
            let targetButton = (e.target as HTMLElement).closest(".btn-score");
            if (targetButton) {
                let allButtons = btnScoreGroup.querySelectorAll(".btn-score");
                allButtons.forEach((button) => button.classList.remove("active"));
                targetButton.classList.add("active");
                this.scoreActive = +targetButton.dataset.score!;
            }
        });
    }

    private renderListFeedback(): void {
        let listFeedbackContent = document.querySelector(".list-feedback-content") as HTMLElement;

        let feedbackHtmls = this.listFeedbackLocal.map((feedback) => {
            return `
                <div class="feedback-content">
                    <div class="feedback-content-header">
                        <i id="update_${feedback.feedbackId}" class="fa-solid fa-pen-to-square"></i>
                        <i id="delete_${feedback.feedbackId}" class="fa-solid fa-xmark"></i>
                    </div>
                    <div class="feedback-content-body">
                        <p class="content-feedback">${feedback.content}</p>
                    </div>
                    <button class="btn-score active">${feedback.score}</button>
                </div>
            `;
        });

        let feedbackHtml = feedbackHtmls.join("");

        listFeedbackContent.innerHTML = feedbackHtml;

        this.reviewNumber.innerHTML = this.listFeedbackLocal.length.toString();
        this.handleDeleteFeedback(); 
        this.handleUpdateFeedback(); 
    }

    private handleDeleteFeedback(): void {
        let listFeedbackContent = document.querySelector(".list-feedback-content") as HTMLElement;
        listFeedbackContent.addEventListener("click", (e) => {
            const deleteButton = (e.target as HTMLElement).closest(".fa-xmark");
            if (deleteButton) {
                const idDelete = deleteButton.id.split("_")[1];
    
                // Hiển thị xác nhận bằng một cửa sổ thông báo đơn giản
                if (confirm("Are you sure?")) {
                    // Lọc ra những feedback không có id trùng với id cần xóa
                    this.listFeedbackLocal = this.listFeedbackLocal.filter(
                        (fb) => fb.feedbackId !== idDelete
                    );
    
                    // Lưu lại danh sách feedback mới vào localStorage
                    localStorage.setItem("feedbacks", JSON.stringify(this.listFeedbackLocal));
    
                    // Render lại danh sách feedback và tính điểm trung bình
                    this.renderListFeedback();
                    this.handleAverageRating();
                }
            }
        });
    }
    
    

    private handleUpdateFeedback(): void {
        let listFeedbackContent = document.querySelector(".list-feedback-content") as HTMLElement;
    
        listFeedbackContent.addEventListener("click", (e) => {
            if (e.target && (e.target as HTMLElement).matches(".fa-pen-to-square")) {
                let idUpdate = (e.target as HTMLElement).id.split("_")[1];
                let updatingFeedbackIndex = this.listFeedbackLocal.findIndex(
                    (fb) => fb.feedbackId === idUpdate
                );
    
                if (updatingFeedbackIndex !== -1) {
                    // Lấy ra feedback cần chỉnh sửa
                    let updatingFeedback = this.listFeedbackLocal[updatingFeedbackIndex];
    
                    // Gán thông tin phản hồi vào input và điểm số
                    this.feedbackInput.value = updatingFeedback.content;
                    this.scoreActive = updatingFeedback.score;
    
                    // Render lại danh sách điểm để active điểm
                    this.renderListButtonScore();
    
                    // Xóa phản hồi cũ khỏi mảng
                    this.listFeedbackLocal.splice(updatingFeedbackIndex, 1);
                }
            }
        });
    }
    
    
    private handleSendButtonClick(): void {
        this.btnSend.addEventListener("click", () => {
            if (confirm("Are you sure?")) {
                const feedback = this.feedbackInput.value.trim();
                if (feedback) {
                    const updatingFeedbackIndex = this.listFeedbackLocal.findIndex(fb => fb.content === feedback);
                    if (updatingFeedbackIndex !== -1) {
                        // Nếu feedback đã tồn tại, cập nhật điểm số
                        this.listFeedbackLocal[updatingFeedbackIndex].score = this.scoreActive;
                    } else {
                        // Nếu feedback chưa tồn tại, tạo mới và thêm vào mảng
                        const newFeedback = {
                            feedbackId: uuidv4(),
                            score: this.scoreActive,
                            content: feedback,
                        };
                        this.listFeedbackLocal.unshift(newFeedback);
                    }
    
                    // Lưu danh sách feedback vào local storage với key là "feedbacks"
                    localStorage.setItem("feedbacks", JSON.stringify(this.listFeedbackLocal));
    
                    // Cập nhật giao diện
                    this.renderListFeedback();
                    this.handleAverageRating();
    
                    // Xóa giá trị trong input
                    this.feedbackInput.value = "";
    
                    // Cập nhật số lượng đánh giá
                    this.reviewNumber.innerHTML = this.listFeedbackLocal.length.toString();
    
                    // Loại bỏ class "btn-dark" nếu có
                    this.btnSend.classList.remove("btn-dark");
                }
            }
        });
    }
    
    
    
    
    
    
    private validateData(): void {
        let feedback = this.feedbackInput.value;
        this.feedbackInput.addEventListener("input", (e) => {
            if (!(e.target as HTMLInputElement).value.trim()) {
                this.error.style.display = "block";
                this.btnSend.classList.remove("btn-dark");
            } else {
                feedback = (e.target as HTMLInputElement).value;
                this.error.style.display = "none";
                this.btnSend.classList.add("btn-dark");
            }
        });
    }

    private handleAverageRating(): void {
        if (this.listFeedbackLocal.length > 0) {
            let totalScoreFeedback = this.listFeedbackLocal.reduce((a, b) => {
                return a + b.score;
            }, 0);

            let averageRating = totalScoreFeedback / this.listFeedbackLocal.length;
            this.averageRate.innerHTML = averageRating.toFixed(1);
        } else {
            this.averageRate.innerHTML = "0";
        }
    }
}

new Feedback();